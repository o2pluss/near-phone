-- products 테이블에 table_id 컬럼 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES product_tables(id) ON DELETE CASCADE;

-- table_id에 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_table_id ON products(table_id);

-- 기존 데이터 정리 (필요시)
-- UPDATE products SET table_id = NULL WHERE table_id IS NULL;
