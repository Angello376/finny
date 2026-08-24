CREATE TABLE `access_users` (
  `email` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `role` text DEFAULT 'user' NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `last_login_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_access_users_status`
ON `access_users` (`status`);
--> statement-breakpoint
INSERT INTO `access_users` (
  `email`,
  `user_id`,
  `role`,
  `status`,
  `created_at`,
  `updated_at`,
  `last_login_at`
) VALUES (
  'angellomelo9@gmail.com',
  NULL,
  'admin',
  'active',
  '2026-08-05T00:00:00.000Z',
  '2026-08-05T00:00:00.000Z',
  NULL
);
