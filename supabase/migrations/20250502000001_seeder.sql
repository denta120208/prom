-- Seeder: create admin user for dashboard login
-- Password: prom-night2026

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  is_super_admin,
  role
)
SELECT
  gen_random_uuid(),
  'Metland@gmail.com',
  '$2b$10$LP/SmNeb7eJLnfyC2eVgxeOzxB013960PNCq/m6F3vgU7zAiZh17W',
  now(),
  now(),
  now(),
  false,
  'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'Metland@gmail.com'
);
