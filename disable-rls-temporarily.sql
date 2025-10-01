-- RLS를 임시로 비활성화하여 개발 환경에서 문제 해결

-- 1. product_tables 테이블의 RLS 비활성화
ALTER TABLE product_tables DISABLE ROW LEVEL SECURITY;

-- 2. products 테이블의 RLS 비활성화
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_tables', 'products');