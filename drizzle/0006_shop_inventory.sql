CREATE TABLE `shop_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`sku` text DEFAULT '' NOT NULL,
	`cost_cents` integer DEFAULT 0 NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`min_stock_quantity` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`created_by_user_id` text DEFAULT '' NOT NULL,
	`updated_by_user_id` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_shop_products_active` ON `shop_products` (`active`);
--> statement-breakpoint
CREATE INDEX `idx_shop_products_name` ON `shop_products` (`name`);
--> statement-breakpoint
CREATE TABLE `shop_inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity_delta` integer NOT NULL,
	`quantity_after` integer NOT NULL,
	`unit_amount_cents` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`created_by_user_id` text DEFAULT '' NOT NULL,
	`created_by_name` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_shop_inventory_movements_product_id` ON `shop_inventory_movements` (`product_id`);
--> statement-breakpoint
CREATE INDEX `idx_shop_inventory_movements_created_at` ON `shop_inventory_movements` (`created_at`);
