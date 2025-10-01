-- product_tables 테이블 완전 재생성
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1단계: 기존 데이터 삭제 (외래키 때문에 순서 중요)
-- 먼저 products 테이블의 product_tables 참조 제거
UPDATE products SET table_id = NULL WHERE table_id IS NOT NULL;

-- 2단계: product_tables 테이블 완전 삭제
DROP TABLE IF EXISTS product_tables CASCADE;

-- 3단계: 새로운 product_tables 테이블 생성 (store_id 포함)
CREATE TABLE product_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  exposure_start_date DATE NOT NULL,
  exposure_end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  table_data JSONB,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4단계: 인덱스 생성
CREATE INDEX idx_product_tables_name ON product_tables(name);
CREATE INDEX idx_product_tables_is_active ON product_tables(is_active);
CREATE INDEX idx_product_tables_created_at ON product_tables(created_at);
CREATE INDEX idx_product_tables_updated_at ON product_tables(updated_at);
CREATE INDEX idx_product_tables_store_id ON product_tables(store_id);

-- 5단계: RLS 활성화 및 정책 설정
ALTER TABLE product_tables ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "product_tables_read_policy" ON product_tables
  FOR SELECT USING (true);

-- 인증된 사용자만 생성 가능 (자신의 스토어만)
CREATE POLICY "product_tables_insert_policy" ON product_tables
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    store_id IN (
      SELECT id FROM stores WHERE seller_id = auth.uid()
    )
  );

-- 인증된 사용자만 수정 가능 (자신의 스토어만)
CREATE POLICY "product_tables_update_policy" ON product_tables
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    store_id IN (
      SELECT id FROM stores WHERE seller_id = auth.uid()
    )
  );

-- 인증된 사용자만 삭제 가능 (자신의 스토어만)
CREATE POLICY "product_tables_delete_policy" ON product_tables
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    store_id IN (
      SELECT id FROM stores WHERE seller_id = auth.uid()
    )
  );

-- 6단계: updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_product_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_tables_updated_at 
  BEFORE UPDATE ON product_tables 
  FOR EACH ROW 
  EXECUTE FUNCTION update_product_tables_updated_at();

-- 7단계: products 테이블에 table_id 외래키 재설정
ALTER TABLE products 
ADD CONSTRAINT fk_products_table_id 
FOREIGN KEY (table_id) REFERENCES product_tables(id) ON DELETE SET NULL;

-- 8단계: 확인
SELECT 'product_tables 테이블 재생성 완료' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_tables' 
ORDER BY ordinal_position;
