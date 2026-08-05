import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
