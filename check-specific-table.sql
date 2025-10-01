-- 특정 테이블의 상품 데이터 확인
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 특정 테이블 정보 확인
SELECT '테이블 정보:' as info;
SELECT id, name, store_id, created_at 
FROM product_tables 
WHERE id = 'cccccad2-af24-4f47-b438-9497d4c85cec';

-- 2. 해당 테이블의 상품들 확인
SELECT '상품 데이터:' as info;
SELECT id, store_id, table_id, device_model_id, carrier, storage, price, conditions, created_at
FROM products 
WHERE table_id = 'cccccad2-af24-4f47-b438-9497d4c85cec'
ORDER BY created_at DESC;

-- 3. 해당 스토어의 모든 상품 확인
SELECT '스토어의 모든 상품:' as info;
SELECT id, store_id, table_id, device_model_id, carrier, storage, price, conditions, created_at
FROM products 
WHERE store_id = '29ef94d2-6b27-4a74-852a-a8ce094638f1'
ORDER BY created_at DESC
LIMIT 10;

-- 4. 최근 생성된 상품들 확인
SELECT '최근 생성된 상품들:' as info;
SELECT id, store_id, table_id, device_model_id, carrier, storage, price, conditions, created_at
FROM products 
ORDER BY created_at DESC
LIMIT 10;
