CREATE TABLE `shop_product_id_repairs` (
  `old_id` text PRIMARY KEY NOT NULL,
  `new_id` text NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `shop_product_id_repairs` (`old_id`, `new_id`)
SELECT '', lower(hex(randomblob(16)))
WHERE EXISTS (
  SELECT 1 FROM `shop_products` WHERE `id` = ''
);
--> statement-breakpoint
UPDATE `shop_inventory_movements`
SET `product_id` = (
  SELECT `new_id` FROM `shop_product_id_repairs` WHERE `old_id` = ''
)
WHERE `product_id` = ''
  AND EXISTS (
    SELECT 1 FROM `shop_product_id_repairs` WHERE `old_id` = ''
  );
--> statement-breakpoint
UPDATE `shop_products`
SET `id` = (
  SELECT `new_id` FROM `shop_product_id_repairs` WHERE `old_id` = ''
)
WHERE `id` = ''
  AND EXISTS (
    SELECT 1 FROM `shop_product_id_repairs` WHERE `old_id` = ''
  );
--> statement-breakpoint
DROP TABLE `shop_product_id_repairs`;
