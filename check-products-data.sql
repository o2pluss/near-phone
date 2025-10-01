-- 상품 데이터 확인
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. product_tables 테이블 확인
SELECT 'product_tables 테이블 데이터:' as info;
SELECT id, name, store_id, created_at 
FROM product_tables 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. products 테이블 확인
SELECT 'products 테이블 데이터:' as info;
SELECT id, store_id, table_id, device_model_id, carrier, storage, price, conditions
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 특정 테이블의 상품 개수 확인
SELECT '특정 테이블 상품 개수:' as info;
SELECT 
  pt.id as table_id,
  pt.name as table_name,
  COUNT(p.id) as product_count
FROM product_tables pt
LEFT JOIN products p ON pt.id = p.table_id
GROUP BY pt.id, pt.name
ORDER BY pt.created_at DESC;

-- 4. stores 테이블 확인
SELECT 'stores 테이블 데이터:' as info;
SELECT id, name, seller_id 
FROM stores 
ORDER BY created_at DESC 
LIMIT 5;
