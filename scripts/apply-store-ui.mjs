import fs from "node:fs";

const path = "app/CardsFinanceirosApp.tsx";
let s = fs.readFileSync(path, "utf8");

function replaceOnce(find, replace, label) {
  if (!s.includes(find)) throw new Error(`Patch target not found: ${label}`);
  s = s.replace(find, replace);
}

replaceOnce('import { useCallback, useEffect, useMemo, useState } from "react";\n','import { useCallback, useEffect, useMemo, useState } from "react";\nimport { StorePanel } from "./store/StorePanel";\n',"store panel import");
replaceOnce(`type StoreProduct = {\n  id: string;\n  name: string;\n  category: string;\n  sku: string;\n  costCents: number;\n  priceCents: number;\n  stockQuantity: number;\n  minStockQuantity: number;\n  active: boolean;`,`type StoreFlavor = {\n  id: string;\n  name: string;\n  stockQuantity: number;\n};\n\ntype StoreProduct = {\n  id: string;\n  name: string;\n  category: string;\n  sku: string;\n  costCents: number;\n  priceCents: number;\n  stockQuantity: number;\n  minStockQuantity: number;\n  flavors: StoreFlavor[];\n  active: boolean;`,"store product type");
replaceOnce(`type StoreInventoryMovement = {\n  id: string;\n  productId: string;\n  type: StoreMovementType;\n  quantityDelta: number;\n  quantityAfter: number;\n  unitAmountCents: number;\n  note: string;`,`type StoreInventoryMovement = {\n  id: string;\n  productId: string;\n  type: StoreMovementType;\n  quantityDelta: number;\n  quantityAfter: number;\n  unitAmountCents: number;\n  flavorId: string;\n  flavorName: string;\n  note: string;`,"store movement type");
replaceOnce(`type StoreProductDraft = {\n  id: string;\n  name: string;\n  category: string;\n  sku: string;\n  costCents: number;\n  priceCents: number;\n  stockQuantity: number;\n  minStockQuantity: number;\n};`,`type StoreProductDraft = {\n  id: string;\n  name: string;\n  category: string;\n  sku: string;\n  costCents: number;\n  priceCents: number;\n  stockQuantity: number;\n  minStockQuantity: number;\n  flavors: StoreFlavor[];\n  markupPercent: number;\n};`,"store draft type");
replaceOnce(`type StoreMovementInput = {\n  productId?: string;\n  type?: "entry" | "sale";\n  quantity?: number;\n  note?: string;\n};`,`type StoreMovementInput = {\n  productId?: string;\n  type?: "entry" | "sale";\n  quantity?: number;\n  note?: string;\n  flavorId?: string;\n};`,"store movement input");
replaceOnce(`const blankStoreProductDraft = (): StoreProductDraft => ({\n  id: "",\n  name: "",\n  category: "",\n  sku: "",\n  costCents: 0,\n  priceCents: 0,\n  stockQuantity: 0,\n  minStockQuantity: 0,\n});`,`const blankStoreProductDraft = (): StoreProductDraft => ({\n  id: "",\n  name: "",\n  category: "",\n  sku: "",\n  costCents: 0,\n  priceCents: 0,\n  stockQuantity: 0,\n  minStockQuantity: 0,\n  flavors: [],\n  markupPercent: 50,\n});`,"blank store draft");
replaceOnce(`      minStockQuantity: product.minStockQuantity,\n    });\n    setStoreMessage("Editando produto.");`,`      minStockQuantity: 0,\n      flavors: product.flavors.map((flavor) => ({ ...flavor })),\n      markupPercent: product.costCents > 0 ? Math.round(((product.priceCents / product.costCents) - 1) * 100) : 50,\n    });\n    setStoreMessage("Editando produto.");`,"edit store product");
replaceOnce(`    const quantity =\n      input?.quantity ?? Number(storeMovementQuantity.replace(/\\D/g, ""));\n    const note = input?.note ?? storeMovementNote;`,`    const quantity =\n      input?.quantity ?? Number(storeMovementQuantity.replace(/\\D/g, ""));\n    const note = input?.note ?? storeMovementNote;\n    const flavorId = input?.flavorId ?? "";`,"movement local flavor");
replaceOnce(`          productId,\n          type,\n          quantity,\n          note,\n        },`,`          productId,\n          type,\n          quantity,\n          note,\n          flavorId,\n        },`,"movement payload flavor");
replaceOnce(`    input: {\n      productId: string;\n      type: "entry" | "sale";\n      quantity: number;\n      note: string;\n    },`,`    input: {\n      productId: string;\n      type: "entry" | "sale";\n      quantity: number;\n      note: string;\n      flavorId?: string;\n    },`,"repository movement input");
const storeStart = s.indexOf("function StorePanel({");
const storeEnd = s.indexOf("\nfunction formatCountdown", storeStart);
if (storeStart < 0 || storeEnd < 0) throw new Error("StorePanel range not found");
s = `${s.slice(0, storeStart)}${s.slice(storeEnd + 1)}`;
fs.writeFileSync(path, s);
console.log("Store UI patch applied.");
