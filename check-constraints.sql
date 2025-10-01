-- products 테이블의 제약 조건 확인
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND contype = 'u';

-- products 테이블 구조 확인
\d products;

-- 현재 products 테이블의 데이터 확인
SELECT COUNT(*) as total_products FROM products;
SELECT table_id, COUNT(*) as count FROM products GROUP BY table_id;
