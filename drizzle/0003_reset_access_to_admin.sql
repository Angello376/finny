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
)
ON CONFLICT(`email`) DO UPDATE SET
  `role` = 'admin',
  `status` = 'active',
  `updated_at` = '2026-08-05T00:00:00.000Z';
--> statement-breakpoint
DELETE FROM `access_users`
WHERE `email` <> 'angellomelo9@gmail.com';
