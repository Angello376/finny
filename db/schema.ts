import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accessUsers = sqliteTable("access_users", {
  email: text("email").primaryKey(),
  userId: text("user_id"),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastLoginAt: text("last_login_at"),
});

export const authEmailEvents = sqliteTable("auth_email_events", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
});

export const financeCards = sqliteTable("finance_cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  type: text("type").notNull(),
  customType: text("custom_type").notNull().default(""),
  date: text("date").notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  description: text("description").notNull().default(""),
  paymentsJson: text("payments_json").notNull().default("[]"),
  imagesJson: text("images_json").notNull().default("[]"),
});

export const supportThreads = sqliteTable(
  "support_threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    source: text("source").notNull().default("user"),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    subject: text("subject").notNull().default(""),
    status: text("status").notNull().default("new"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    lastMessageAt: text("last_message_at").notNull(),
  },
  (table) => [
    index("idx_support_threads_user_id").on(table.userId),
    index("idx_support_threads_status").on(table.status),
    index("idx_support_threads_last_message_at").on(table.lastMessageAt),
  ],
);

export const supportMessages = sqliteTable(
  "support_messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id").notNull(),
    senderType: text("sender_type").notNull(),
    senderName: text("sender_name").notNull().default(""),
    senderEmail: text("sender_email").notNull().default(""),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_support_messages_thread_id").on(table.threadId)],
);

export const shopProducts = sqliteTable(
  "shop_products",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull().default(""),
    sku: text("sku").notNull().default(""),
    costCents: integer("cost_cents").notNull().default(0),
    priceCents: integer("price_cents").notNull().default(0),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    minStockQuantity: integer("min_stock_quantity").notNull().default(0),
    flavorsJson: text("flavors_json").notNull().default("[]"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    createdByUserId: text("created_by_user_id").notNull().default(""),
    updatedByUserId: text("updated_by_user_id").notNull().default(""),
  },
  (table) => [
    index("idx_shop_products_active").on(table.active),
    index("idx_shop_products_name").on(table.name),
  ],
);

export const shopInventoryMovements = sqliteTable(
  "shop_inventory_movements",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").notNull(),
    type: text("type").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    unitAmountCents: integer("unit_amount_cents").notNull().default(0),
    flavorId: text("flavor_id").notNull().default(""),
    flavorName: text("flavor_name").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull(),
    createdByUserId: text("created_by_user_id").notNull().default(""),
    createdByName: text("created_by_name").notNull().default(""),
  },
  (table) => [
    index("idx_shop_inventory_movements_product_id").on(table.productId),
    index("idx_shop_inventory_movements_created_at").on(table.createdAt),
  ],
);
