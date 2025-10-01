-- product_tables 테이블에 store_id 컬럼 추가
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. product_tables 테이블에 store_id 컬럼 추가 (stores 테이블 참조)
ALTER TABLE product_tables 
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- 2. 기존 데이터에 대한 store_id 업데이트 (products 테이블에서 가져오기)
UPDATE product_tables 
SET store_id = (
  SELECT DISTINCT p.store_id 
  FROM products p 
  WHERE p.table_id = product_tables.id 
  LIMIT 1
)
WHERE store_id IS NULL;

-- 3. store_id를 NOT NULL로 설정
ALTER TABLE product_tables 
ALTER COLUMN store_id SET NOT NULL;

-- 4. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_product_tables_store_id ON product_tables(store_id);

-- 5. RLS 정책 업데이트
DROP POLICY IF EXISTS "product_tables_all_authenticated" ON product_tables;
CREATE POLICY "product_tables_store_access" ON product_tables
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        store_id IN (
            SELECT id FROM stores 
            WHERE seller_id = auth.uid()
        )
    );

-- 6. 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_tables' 
ORDER BY ordinal_position;
