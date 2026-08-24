CREATE TABLE `finance_cards` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `type` text NOT NULL,
  `custom_type` text DEFAULT '' NOT NULL,
  `date` text NOT NULL,
  `amount_cents` integer DEFAULT 0 NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `payments_json` text DEFAULT '[]' NOT NULL,
  `images_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_finance_cards_user_updated`
ON `finance_cards` (`user_id`, `updated_at`);
--> statement-breakpoint
CREATE INDEX `idx_finance_cards_user_date`
ON `finance_cards` (`user_id`, `date`);
