import { desc, eq } from "drizzle-orm";
import { requireStoreUser, type AuthenticatedAppUser } from "@/app/api/supabase-auth";
import { getDb } from "@/db";
import { shopInventoryMovements, shopProducts } from "@/db/schema";

export type StoreMovementType = "entry" | "sale" | "adjustment" | "initial";

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  sku: string;
  costCents: number;
  priceCents: number;
  stockQuantity: number;
  minStockQuantity: number;
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
};

type StoreMovementInput = {
  productId?: string;
  type?: StoreMovementType;
  quantity?: number;
  unitAmountCents?: number;
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
    .limit(40);

  return {
    products: products.map(rowToProduct),
    movements: movements.map(rowToMovement),
  };
}

export async function upsertStoreProduct(
  user: AuthenticatedAppUser,
  input: StoreProductInput,
) {
  const product = normalizeProductInput(input);

  if (!product.name) {
    return {
      product: null,
      response: Response.json(
        { error: "Informe o nome do produto." },
        { status: 400 },
      ),
    };
  }

  const db = getDb();
  const now = new Date().toISOString();
  const existing = product.id
    ? await db
        .select()
        .from(shopProducts)
        .where(eq(shopProducts.id, product.id))
        .limit(1)
    : [];
  const existingProduct = existing[0] ? rowToProduct(existing[0]) : null;
  const productId = existingProduct?.id || product.id || crypto.randomUUID();
  const nextProduct: StoreProduct = {
    id: productId,
    name: product.name,
    category: product.category,
    sku: product.sku,
    costCents: product.costCents,
    priceCents: product.priceCents,
    stockQuantity: product.stockQuantity,
    minStockQuantity: product.minStockQuantity,
    active: true,
    createdAt: existingProduct?.createdAt ?? now,
    updatedAt: now,
    createdByUserId: existingProduct?.createdByUserId ?? user.id,
    updatedByUserId: user.id,
  };

  if (existingProduct) {
    await db
      .update(shopProducts)
      .set({
        name: nextProduct.name,
        category: nextProduct.category,
        sku: nextProduct.sku,
        costCents: nextProduct.costCents,
        priceCents: nextProduct.priceCents,
        stockQuantity: nextProduct.stockQuantity,
        minStockQuantity: nextProduct.minStockQuantity,
        active: true,
        updatedAt: now,
        updatedByUserId: user.id,
      })
      .where(eq(shopProducts.id, productId));

    const stockDelta = nextProduct.stockQuantity - existingProduct.stockQuantity;
    if (stockDelta !== 0) {
      await insertMovement(user, {
        productId,
        type: "adjustment",
        quantityDelta: stockDelta,
        quantityAfter: nextProduct.stockQuantity,
        unitAmountCents: nextProduct.costCents,
        note: "Ajuste manual",
        createdAt: now,
      });
    }
  } else {
    await db.insert(shopProducts).values(productToRow(nextProduct));

    if (nextProduct.stockQuantity > 0) {
      await insertMovement(user, {
        productId,
        type: "initial",
        quantityDelta: nextProduct.stockQuantity,
        quantityAfter: nextProduct.stockQuantity,
        unitAmountCents: nextProduct.costCents,
        note: "Estoque inicial",
        createdAt: now,
      });
    }
  }

  return { product: nextProduct, response: null };
}

export async function createStoreMovement(
  user: AuthenticatedAppUser,
  input: StoreMovementInput,
) {
  const productId = cleanText(input.productId, 120);
  const quantity = normalizeQuantity(input.quantity);
  const type = input.type === "sale" ? "sale" : "entry";

  if (!productId) {
    return {
      movement: null,
      response: Response.json(
        { error: "Selecione um produto." },
        { status: 400 },
      ),
    };
  }

  if (quantity <= 0) {
    return {
      movement: null,
      response: Response.json(
        { error: "Informe uma quantidade maior que zero." },
        { status: 400 },
      ),
    };
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(shopProducts)
    .where(eq(shopProducts.id, productId))
    .limit(1);

  if (!row || !row.active) {
    return {
      movement: null,
      response: Response.json(
        { error: "Produto nao encontrado." },
        { status: 404 },
      ),
    };
  }

  const product = rowToProduct(row);
  const quantityDelta = type === "entry" ? quantity : -quantity;
  const quantityAfter = product.stockQuantity + quantityDelta;

  if (quantityAfter < 0) {
    return {
      movement: null,
      response: Response.json(
        { error: "Nao ha estoque suficiente para esta saida." },
        { status: 400 },
      ),
    };
  }

  const now = new Date().toISOString();
  const unitAmountCents =
    normalizeCents(input.unitAmountCents) ||
    (type === "entry" ? product.costCents : product.priceCents);

  await db
    .update(shopProducts)
    .set({
      stockQuantity: quantityAfter,
      updatedAt: now,
      updatedByUserId: user.id,
    })
    .where(eq(shopProducts.id, productId));

  const movement = await insertMovement(user, {
    productId,
    type,
    quantityDelta,
    quantityAfter,
    unitAmountCents,
    note: cleanText(input.note, 240),
    createdAt: now,
  });

  return { movement, response: null };
}

export async function archiveStoreProduct(productId: string) {
  const id = cleanText(productId, 120);

  if (!id) {
    return Response.json({ error: "Produto invalido." }, { status: 400 });
  }

  await getDb()
    .update(shopProducts)
    .set({ active: false, updatedAt: new Date().toISOString() })
    .where(eq(shopProducts.id, id));

  return null;
}

async function insertMovement(
  user: AuthenticatedAppUser,
  input: {
    productId: string;
    type: StoreMovementType;
    quantityDelta: number;
    quantityAfter: number;
    unitAmountCents: number;
    note: string;
    createdAt: string;
  },
) {
  const movement: StoreInventoryMovement = {
    id: crypto.randomUUID(),
    productId: input.productId,
    type: input.type,
    quantityDelta: input.quantityDelta,
    quantityAfter: input.quantityAfter,
    unitAmountCents: input.unitAmountCents,
    note: input.note,
    createdAt: input.createdAt,
    createdByUserId: user.id,
    createdByName: user.displayName,
  };

  await getDb().insert(shopInventoryMovements).values(movementToRow(movement));

  return movement;
}

function normalizeProductInput(input: StoreProductInput) {
  return {
    id: cleanText(input.id, 120),
    name: cleanText(input.name, 90),
    category: cleanText(input.category, 60),
    sku: cleanText(input.sku, 60),
    costCents: normalizeCents(input.costCents),
    priceCents: normalizeCents(input.priceCents),
    stockQuantity: Math.max(0, normalizeQuantity(input.stockQuantity)),
    minStockQuantity: Math.max(0, normalizeQuantity(input.minStockQuantity)),
  };
}

function normalizeCents(value: number | undefined) {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.round(numericValue));
}

function normalizeQuantity(value: number | undefined) {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.trunc(numericValue);
}

function rowToProduct(row: StoreProductRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    sku: row.sku,
    costCents: row.costCents,
    priceCents: row.priceCents,
    stockQuantity: row.stockQuantity,
    minStockQuantity: row.minStockQuantity,
    active: Boolean(row.active),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdByUserId: row.createdByUserId,
    updatedByUserId: row.updatedByUserId,
  };
}

function rowToMovement(row: StoreMovementRow): StoreInventoryMovement {
  return {
    id: row.id,
    productId: row.productId,
    type: normalizeMovementType(row.type),
    quantityDelta: row.quantityDelta,
    quantityAfter: row.quantityAfter,
    unitAmountCents: row.unitAmountCents,
    note: row.note,
    createdAt: row.createdAt,
    createdByUserId: row.createdByUserId,
    createdByName: row.createdByName,
  };
}

function productToRow(product: StoreProduct) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    sku: product.sku,
    costCents: product.costCents,
    priceCents: product.priceCents,
    stockQuantity: product.stockQuantity,
    minStockQuantity: product.minStockQuantity,
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    createdByUserId: product.createdByUserId,
    updatedByUserId: product.updatedByUserId,
  };
}

function movementToRow(movement: StoreInventoryMovement) {
  return {
    id: movement.id,
    productId: movement.productId,
    type: movement.type,
    quantityDelta: movement.quantityDelta,
    quantityAfter: movement.quantityAfter,
    unitAmountCents: movement.unitAmountCents,
    note: movement.note,
    createdAt: movement.createdAt,
    createdByUserId: movement.createdByUserId,
    createdByName: movement.createdByName,
  };
}

function normalizeMovementType(type: string): StoreMovementType {
  if (type === "sale") return "sale";
  if (type === "adjustment") return "adjustment";
  if (type === "initial") return "initial";
  return "entry";
}

function cleanText(value: string | undefined, maxLength: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}
