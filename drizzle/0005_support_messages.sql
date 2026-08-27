CREATE TABLE `support_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`source` text DEFAULT 'user' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_message_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_threads_user_id` ON `support_threads` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_support_threads_status` ON `support_threads` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_support_threads_last_message_at` ON `support_threads` (`last_message_at`);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`sender_type` text NOT NULL,
	`sender_name` text DEFAULT '' NOT NULL,
	`sender_email` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_messages_thread_id` ON `support_messages` (`thread_id`);
