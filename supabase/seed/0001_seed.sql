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
  '필수 요금제,카드 할인' as conditions
from public.stores s
cross join public.products p;


