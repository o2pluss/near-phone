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

-- Create test seller user
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
  'seller@example.com',
  crypt('seller123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "seller"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create test seller profile
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
  'seller',
  '테스트 판매자',
  '010-1111-2222',
  'email',
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'seller@example.com';

-- Create approved seller application for test seller
INSERT INTO public.seller_applications (
  user_id,
  business_name,
  business_license,
  business_address,
  contact_name,
  contact_phone,
  contact_email,
  business_description,
  status,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
) SELECT 
  u.id,
  '테스트 매장',
  '123-45-67890',
  '서울시 강남구 테스트로 123',
  '테스트 판매자',
  '010-1111-2222',
  'seller@example.com',
  '테스트용 매장입니다.',
  'approved',
  admin_u.id,
  NOW(),
  NOW(),
  NOW()
FROM auth.users u 
CROSS JOIN auth.users admin_u
WHERE u.email = 'seller@example.com' 
  AND admin_u.email = 'admin@example.com';

-- Create test user
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
  'user@example.com',
  crypt('user123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "user"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create test user profile
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
  'user',
  '테스트 사용자',
  '010-3333-4444',
  'email',
  true,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'user@example.com';

-- Minimal seed data for development
insert into public.products (id, name, brand, model, storage, color, official_price)
values
  (gen_random_uuid(), 'iPhone 15 Pro', 'Apple', 'A3100', '256GB', 'Natural', 1500000),
  (gen_random_uuid(), 'Galaxy S24 Ultra', 'Samsung', 'S928', '256GB', 'Black', 1600000);

-- Create two demo stores
insert into public.stores (id, name, description, address, latitude, longitude, phone, is_verified)
values
  (gen_random_uuid(), '강남 모바일센터', '최신 스마트폰 특가', '서울 강남구 테헤란로 123', 37.498, 127.027, '02-1234-5678', true),
  (gen_random_uuid(), '서초 스마트폰', '친절 상담', '서울 서초구 서초대로 456', 37.492, 127.015, '02-2345-6789', true);

-- Create store_products with carrier information
insert into public.store_products (store_id, product_id, price, carrier, storage, signup_type, conditions)
select 
  s.id as store_id,
  p.id as product_id,
  CASE 
    WHEN p.name = 'iPhone 15 Pro' THEN 1200000
    WHEN p.name = 'Galaxy S24 Ultra' THEN 1300000
    ELSE 1000000
  END as price,
  CASE 
    WHEN s.name = '강남 모바일센터' THEN 'kt'
    WHEN s.name = '서초 스마트폰' THEN 'skt'
    ELSE 'lgu'
  END as carrier,
  '256gb' as storage,
  '신규가입' as signup_type,
  '필수요금제,카드할인' as conditions
from public.stores s
cross join public.products p;


