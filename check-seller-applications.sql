-- seller_applications 테이블 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'seller_applications' 
ORDER BY ordinal_position;

-- seller_applications 테이블의 데이터 확인
SELECT id, business_name, status, created_at 
FROM seller_applications 
ORDER BY created_at DESC 
LIMIT 10;

-- seller_applications 테이블이 존재하는지 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'seller_applications'
);
