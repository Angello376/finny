INSERT INTO `access_users` (
  `email`,
  `user_id`,
  `role`,
  `status`,
  `created_at`,
  `updated_at`,
  `last_login_at`
) VALUES (
  'angellorosa9@gmail.com',
  NULL,
  'user',
  'active',
  '2026-08-05T00:00:00.000Z',
  '2026-08-05T00:00:00.000Z',
  NULL
)
ON CONFLICT(`email`) DO UPDATE SET
  `role` = 'user',
  `status` = 'active',
  `updated_at` = '2026-08-05T00:00:00.000Z';
