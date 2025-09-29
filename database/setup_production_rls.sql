-- 프로덕션용 RLS 정책 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage product_tables" ON product_tables;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Allow all operations on product_tables" ON product_tables;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;

-- 사용자별 데이터 접근 정책 (프로덕션 권장)
CREATE POLICY "Users can manage their own product_tables" ON product_tables
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage products in their tables" ON products
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        table_id IN (
            SELECT id FROM product_tables 
            WHERE auth.uid() IS NOT NULL
        )
    );

-- 또는 더 간단한 정책 (개발/테스트용)
-- CREATE POLICY "Authenticated users can manage product_tables" ON product_tables
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can manage products" ON products
--     FOR ALL USING (auth.role() = 'authenticated');
