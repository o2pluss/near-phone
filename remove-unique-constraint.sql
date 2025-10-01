-- products 테이블의 UNIQUE 제약 조건 제거
-- 중복 상품 저장을 허용하기 위해

-- 1. 현재 제약 조건 확인
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND contype = 'u';

-- 2. UNIQUE 제약 조건 제거
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_store_id_device_model_id_carrier_storage_condition_key;

-- 3. 제거 후 확인
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND contype = 'u';
