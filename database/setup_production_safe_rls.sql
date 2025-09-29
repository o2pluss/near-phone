-- 프로덕션 안전한 RLS 정책 설정
-- 이 스크립트는 Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage product_tables" ON product_tables;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Allow all operations on product_tables" ON product_tables;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

-- 2. RLS 활성화 확인
ALTER TABLE product_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. 안전한 RLS 정책 생성
-- 인증된 사용자는 모든 product_tables에 접근 가능
CREATE POLICY "Authenticated users can manage product_tables" ON product_tables
    FOR ALL USING (auth.role() = 'authenticated');

-- 인증된 사용자는 모든 products에 접근 가능
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('product_tables', 'products');

-- 5. RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_tables', 'products');
