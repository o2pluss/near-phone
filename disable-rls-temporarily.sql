-- 개발 환경에서 RLS 임시 비활성화
-- 프로덕션에서는 다시 활성화해야 함

-- product_tables 테이블 RLS 비활성화
ALTER TABLE product_tables DISABLE ROW LEVEL SECURITY;

-- products 테이블 RLS 비활성화  
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_tables', 'products');
