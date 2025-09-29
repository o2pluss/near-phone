-- 올바른 products 테이블 생성
-- 기존 테이블이 잘못된 구조라면 삭제하고 새로 생성

-- 1. 기존 products 테이블 삭제 (데이터가 있다면 백업 필요)
DROP TABLE IF EXISTS products CASCADE;

-- 2. 올바른 products 테이블 생성
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES seller_applications(id),
  device_model_id UUID NOT NULL REFERENCES device_models(id),
  carrier VARCHAR(20) NOT NULL, -- 'KT', 'SKT', 'LG_U_PLUS'
  storage VARCHAR(10) NOT NULL, -- '128GB', '256GB', '512GB', '2TB'
  price INTEGER NOT NULL, -- 이 조합의 가격
  conditions TEXT[] DEFAULT '{}', -- ['번호이동', '신규가입', '기기변경']
  is_active BOOLEAN DEFAULT true,
  table_id UUID REFERENCES product_tables(id), -- 상품 테이블 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  UNIQUE(store_id, device_model_id, carrier, storage, conditions),
  
  -- 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_carrier CHECK (
    carrier IN ('KT', 'SKT', 'LG_U_PLUS')
  ),
  CONSTRAINT valid_storage CHECK (
    storage IN ('128GB', '256GB', '512GB', '2TB')
  )
);

-- 3. 인덱스 생성
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_device_model_id ON products(device_model_id);
CREATE INDEX idx_products_carrier ON products(carrier);
CREATE INDEX idx_products_storage ON products(storage);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_table_id ON products(table_id);

-- 4. RLS 비활성화 (개발 환경)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_products_updated_at();
