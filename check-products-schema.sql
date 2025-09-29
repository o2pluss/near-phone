-- products 테이블 스키마 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- products 테이블의 모든 컬럼 확인
\d products;
