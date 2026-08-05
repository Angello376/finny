import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
