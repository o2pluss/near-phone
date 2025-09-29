-- product_tables 테이블 생성
CREATE TABLE IF NOT EXISTS product_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  exposure_start_date DATE NOT NULL,
  exposure_end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  table_data JSONB, -- 상품 테이블의 실제 데이터 (모델+용량+통신사+조건별 가격 매트릭스)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_tables_name ON product_tables(name);
CREATE INDEX IF NOT EXISTS idx_product_tables_is_active ON product_tables(is_active);
CREATE INDEX IF NOT EXISTS idx_product_tables_created_at ON product_tables(created_at);
CREATE INDEX IF NOT EXISTS idx_product_tables_updated_at ON product_tables(updated_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE product_tables ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "product_tables_read_policy" ON product_tables
  FOR SELECT USING (true);

-- 인증된 사용자만 생성 가능
CREATE POLICY "product_tables_insert_policy" ON product_tables
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 수정 가능
CREATE POLICY "product_tables_update_policy" ON product_tables
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "product_tables_delete_policy" ON product_tables
  FOR DELETE USING (auth.role() = 'authenticated');

-- updated_at 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_tables_updated_at 
  BEFORE UPDATE ON product_tables 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
