-- RLS 정책을 임시로 더 관대하게 설정하여 개발 환경에서 문제 해결

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "product_tables_read_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_insert_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_update_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_delete_policy" ON product_tables;
DROP POLICY IF EXISTS "p_product_tables_read" ON product_tables;
DROP POLICY IF EXISTS "p_product_tables_insert" ON product_tables;
DROP POLICY IF EXISTS "p_product_tables_update" ON product_tables;
DROP POLICY IF EXISTS "p_product_tables_delete" ON product_tables;

-- 2. 새로운 정책 생성 (모든 인증된 사용자 허용)
CREATE POLICY "product_tables_all_authenticated" ON product_tables
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. products 테이블도 동일하게 설정
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

CREATE POLICY "products_all_authenticated" ON products
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 4. 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('product_tables', 'products')
ORDER BY tablename, policyname;
