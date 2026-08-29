import { desc, eq } from "drizzle-orm";
import { requireStoreUser, type AuthenticatedAppUser } from "@/app/api/supabase-auth";
import { getDb } from "@/db";
import { shopInventoryMovements, shopProducts } from "@/db/schema";

export type StoreMovementType = "entry" | "sale" | "adjustment" | "initial";

export type StoreFlavor = { id: string; name: string; stockQuantity: number };

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  sku: string;
  costCents: number;
  priceCents: number;
  stockQuantity: number;
  minStockQuantity: number;
  flavors: StoreFlavor[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
};

export type StoreInventoryMovement = {
  id: string;
  productId: string;
  type: StoreMovementType;
  quantityDelta: number;
  quantityAfter: number;
  unitAmountCents: number;
  flavorId: string;
  flavorName: string;
  note: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
};

type StoreProductInput = {
  id?: string;
  name?: string;
  category?: string;
  sku?: string;
  costCents?: number;
  priceCents?: number;
  stockQuantity?: number;
  minStockQuantity?: number;
  flavors?: StoreFlavor[];
};

type StoreMovementInput = {
  productId?: string;
  type?: StoreMovementType;
  quantity?: number;
  unitAmountCents?: number;
  flavorId?: string;
  note?: string;
};

type StoreProductRow = typeof shopProducts.$inferSelect;
type StoreMovementRow = typeof shopInventoryMovements.$inferSelect;

export async function requireApiStoreUser(request: Request) {
  return requireStoreUser(request);
}

export async function listStoreInventory() {
  const db = getDb();
  const products = await db
    .select()
    .from(shopProducts)
    .where(eq(shopProducts.active, true))
    .orderBy(shopProducts.name);
  const movements = await db
    .select()
    .from(shopInventoryMovements)
    .orderBy(desc(shopInventoryMovements.createdAt))
    .limit(80);

  return { products: products.map(rowToProduct), movements: movements.map(rowToMovement) };
}

export async function upsertStoreProduct(user: AuthenticatedAppUser, input: StoreProductInput) {
  const product = normalizeProductInput(input);
  if (!product.name) {
    return { product: null, response: Response.json({ error: "Informe o nome do produto." }, { status: 400 }) };
  }
  if (product.costCents <= 0) {
    return { product: null, response: Response.json({ error: "Informe quanto você pagou pelo produto." }, { status: 400 }) };
  }
  if (!product.flavors.length) {
    return { product: null, response: Response.json({ error: "Cadastre pelo menos um sabor." }, { status: 400 }) };
  }

  const db = getDb();
  const now = new Date().toISOString();
  const existing = product.id
    ? await db.select().from(shopProducts).where(eq(shopProducts.id, product.id)).limit(1)
    : [];
  const existingProduct = existing[0] ? rowToProduct(existing[0]) : null;
  const productId = existingProduct?.id || product.id || crypto.randomUUID();
  const stockQuantity = product.flavors.reduce((sum, flavor) => sum + flavor.stockQuantity, 0);
  const nextProduct: StoreProduct = {
    id: productId,
    name: product.name,
    category: product.category,
    sku: product.sku,
    costCents: product.costCents,
    priceCents: product.priceCents,
    stockQuantity,
    minStockQuantity: 0,
    flavors: product.flavors,
    active: true,
    createdAt: existingProduct?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingProduct?.createdByUserId ?? user.id,
    updatedByUserId: user.id,
  };

  if (existingProduct) {
    await db.update(shopProducts).set({
      name: nextProduct.name,
      category: nextProduct.category,
      sku: nextProduct.sku,
      costCents: nextProduct.costCents,
      priceCents: nextProduct.priceCents,
      stockQuantity: nextProduct.stockQuantity,
      minStockQuantity: 0,
      flavorsJson: JSON.stringify(nextProduct.flavors),
      active: true,
      updatedAt: now,
      updatedByUserId: user.id,
    }).where(eq(shopProducts.id, productId));
  } else {
    await db.insert(shopProducts).values(productToRow(nextProduct));
    if (nextProduct.stockQuantity > 0) {
      await insertMovement(user, {
        productId,
        type: "initial",
        quantityDelta: nextProduct.stockQuantity,
        quantityAfter: nextProduct.stockQuantity,
        unitAmountCents: nextProduct.costCents,
        flavorId: "",
        flavorName: "",
        note: "Estoque inicial",
        createdAt: now,
      });
    }
  }

  return { product: nextProduct, response: null };
}

export async function createStoreMovement(user: AuthenticatedAppUser, input: StoreMovementInput) {
  const productId = cleanText(input.productId, 120);
  const quantity = normalizeQuantity(input.quantity);
  const type = input.type === "sale" ? "sale" : "entry";
  const flavorId = cleanText(input.flavorId, 120);

  if (!productId) return { movement: null, response: Response.json({ error: "Selecione um produto." }, { status: 400 }) };
  if (quantity <= 0) return { movement: null, response: Response.json({ error: "Informe uma quantidade maior que zero." }, { status: 400 }) };

  const db = getDb();
  const [row] = await db.select().from(shopProducts).where(eq(shopProducts.id, productId)).limit(1);
  if (!row || !row.active) return { movement: null, response: Response.json({ error: "Produto nao encontrado." }, { status: 404 }) };

  const product = rowToProduct(row);
  const flavor = product.flavors.find((item) => item.id === flavorId) ?? null;
  if (!flavor) return { movement: null, response: Response.json({ error: "Selecione um sabor." }, { status: 400 }) };

  const quantityDelta = type === "entry" ? quantity : -quantity;
  const flavorQuantityAfter = flavor.stockQuantity + quantityDelta;
  const quantityAfter = product.stockQuantity + quantityDelta;
  if (flavorQuantityAfter < 0 || quantityAfter < 0) {
    return { movement: null, response: Response.json({ error: "Nao ha estoque suficiente para esta saida." }, { status: 400 }) };
  }

  const now = new Date().toISOString();
  const nextFlavors = product.flavors.map((item) => item.id === flavor.id ? { ...item, stockQuantity: flavorQuantityAfter } : item);
  const unitAmountCents = normalizeCents(input.unitAmountCents) || (type === "entry" ? product.costCents : product.priceCents);

  await db.update(shopProducts).set({
    stockQuantity: quantityAfter,
    flavorsJson: JSON.stringify(nextFlavors),
    updatedAt: now,
    updatedByUserId: user.id,
  }).where(eq(shopProducts.id, productId));

  const movement = await insertMovement(user, {
    productId,
    type,
    quantityDelta,
    quantityAfter,
    unitAmountCents,
    flavorId: flavor.id,
    flavorName: flavor.name,
    note: cleanText(input.note, 240),
    createdAt: now,
  });
  return { movement, response: null };
}

export async function archiveStoreProduct(productId: string) {
  const id = cleanText(productId, 120);
  if (!id) return Response.json({ error: "Produto invalido." }, { status: 400 });
  await getDb().update(shopProducts).set({ active: false, updatedAt: new Date().toISOString() }).where(eq(shopProducts.id, id));
  return null;
}

async function insertMovement(user: AuthenticatedAppUser, input: {
  productId: string; type: StoreMovementType; quantityDelta: number; quantityAfter: number;
  unitAmountCents: number; flavorId: string; flavorName: string; note: string; createdAt: string;
}) {
  const movement: StoreInventoryMovement = {
    id: crypto.randomUUID(), productId: input.productId, type: input.type,
    quantityDelta: input.quantityDelta, quantityAfter: input.quantityAfter,
    unitAmountCents: input.unitAmountCents, flavorId: input.flavorId, flavorName: input.flavorName,
    note: input.note, createdAt: input.createdAt, createdByUserId: user.id, createdByName: user.displayName,
  };
  await getDb().insert(shopInventoryMovements).values(movementToRow(movement));
  return movement;
}

function normalizeProductInput(input: StoreProductInput) {
  const legacyStock = Math.max(0, normalizeQuantity(input.stockQuantity));
  const flavors = Array.isArray(input.flavors)
    ? input.flavors.map((flavor) => ({ id: cleanText(flavor.id, 120) || crypto.randomUUID(), name: cleanText(flavor.name, 80), stockQuantity: Math.max(0, normalizeQuantity(flavor.stockQuantity)) })).filter((flavor) => flavor.name)
    : legacyStock > 0 ? [{ id: crypto.randomUUID(), name: "Sem sabor", stockQuantity: legacyStock }] : [];
  return {
    id: cleanText(input.id, 120), name: cleanText(input.name, 90), category: cleanText(input.category, 60), sku: cleanText(input.sku, 60),
    costCents: normalizeCents(input.costCents), priceCents: normalizeCents(input.priceCents), stockQuantity: flavors.reduce((sum, flavor) => sum + flavor.stockQuantity, 0),
    minStockQuantity: 0, flavors,
  };
}

function normalizeCents(value: number | undefined) { const n = Number(value ?? 0); return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0; }
function normalizeQuantity(value: number | undefined) { const n = Number(value ?? 0); return Number.isFinite(n) ? Math.trunc(n) : 0; }

function parseFlavors(raw: string, legacyStock: number): StoreFlavor[] {
  try {
    const parsed = JSON.parse(raw || "[]") as unknown;
    if (Array.isArray(parsed)) return parsed.map((item) => {
      const value = item as Record<string, unknown>;
      return { id: String(value.id || crypto.randomUUID()), name: String(value.name || "").trim(), stockQuantity: Math.max(0, Number(value.stockQuantity) || 0) };
    }).filter((item) => item.name);
  } catch {}
  return legacyStock > 0 ? [{ id: crypto.randomUUID(), name: "Sem sabor", stockQuantity: legacyStock }] : [];
}

function rowToProduct(row: StoreProductRow): StoreProduct {
  const flavors = parseFlavors(row.flavorsJson, row.stockQuantity);
  return { id: row.id, name: row.name, category: row.category, sku: row.sku, costCents: row.costCents, priceCents: row.priceCents, stockQuantity: flavors.reduce((sum, flavor) => sum + flavor.stockQuantity, 0), minStockQuantity: 0, flavors, active: Boolean(row.active), createdAt: row.createdAt, updatedAt: row.updatedAt, createdByUserId: row.createdByUserId, updatedByUserId: row.updatedByUserId };
}

function rowToMovement(row: StoreMovementRow): StoreInventoryMovement {
  return { id: row.id, productId: row.productId, type: normalizeMovementType(row.type), quantityDelta: row.quantityDelta, quantityAfter: row.quantityAfter, unitAmountCents: row.unitAmountCents, flavorId: row.flavorId ?? "", flavorName: row.flavorName ?? "", note: row.note, createdAt: row.createdAt, createdByUserId: row.createdByUserId, createdByName: row.createdByName };
}

function productToRow(product: StoreProduct) {
  return { id: product.id, name: product.name, category: product.category, sku: product.sku, costCents: product.costCents, priceCents: product.priceCents, stockQuantity: product.stockQuantity, minStockQuantity: 0, flavorsJson: JSON.stringify(product.flavors), active: product.active, createdAt: product.createdAt, updatedAt: product.updatedAt, createdByUserId: product.createdByUserId, updatedByUserId: product.updatedByUserId };
}

function movementToRow(movement: StoreInventoryMovement) {
  return { id: movement.id, productId: movement.productId, type: movement.type, quantityDelta: movement.quantityDelta, quantityAfter: movement.quantityAfter, unitAmountCents: movement.unitAmountCents, flavorId: movement.flavorId, flavorName: movement.flavorName, note: movement.note, createdAt: movement.createdAt, createdByUserId: movement.createdByUserId, createdByName: movement.createdByName };
}

function normalizeMovementType(type: string): StoreMovementType {
  if (type === "sale") return "sale";
  if (type === "adjustment") return "adjustment";
  if (type === "initial") return "initial";
  return "entry";
}
function cleanText(value: string | undefined, maxLength: number) { return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength); }
