-- product_tables 테이블에 대한 RLS 정책 설정

-- 1. RLS 활성화
ALTER TABLE product_tables ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "product_tables_select_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_insert_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_update_policy" ON product_tables;
DROP POLICY IF EXISTS "product_tables_delete_policy" ON product_tables;

-- 3. 모든 사용자가 읽기 가능하도록 설정 (임시)
CREATE POLICY "product_tables_select_policy" ON product_tables
    FOR SELECT USING (true);

-- 4. 인증된 사용자가 삽입 가능하도록 설정
CREATE POLICY "product_tables_insert_policy" ON product_tables
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. 인증된 사용자가 수정 가능하도록 설정
CREATE POLICY "product_tables_update_policy" ON product_tables
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. 인증된 사용자가 삭제 가능하도록 설정
CREATE POLICY "product_tables_delete_policy" ON product_tables
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. products 테이블에도 RLS 정책 설정 (있다면)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- products 테이블 기존 정책 삭제
DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;

-- products 테이블 정책 생성
CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_insert_policy" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_update_policy" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "products_delete_policy" ON products
    FOR DELETE USING (auth.role() = 'authenticated');
