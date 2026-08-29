ALTER TABLE shop_products ADD COLUMN flavors_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE shop_inventory_movements ADD COLUMN flavor_id TEXT NOT NULL DEFAULT '';
ALTER TABLE shop_inventory_movements ADD COLUMN flavor_name TEXT NOT NULL DEFAULT '';
