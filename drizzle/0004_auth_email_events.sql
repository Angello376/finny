CREATE TABLE `auth_email_events` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_auth_email_events_created_at`
ON `auth_email_events` (`created_at`);
