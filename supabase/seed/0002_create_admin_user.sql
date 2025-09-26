-- Create admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create admin profile
INSERT INTO public.profiles (
  user_id,
  role,
  name,
  phone,
  login_type,
  is_active,
  created_at,
  updated_at
) SELECT 
  u.id,
  'admin',
  '관리자',
  '010-0000-0000',
  'email',
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'admin@example.com';
