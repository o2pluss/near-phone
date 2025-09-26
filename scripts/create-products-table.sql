-- products 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. products 테이블 생성
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL,
  device_model_id UUID NOT NULL,
  carrier VARCHAR(20) NOT NULL,
  storage VARCHAR(10) NOT NULL,
  price INTEGER NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 외래키 제약조건
  CONSTRAINT fk_products_device_model 
    FOREIGN KEY (device_model_id) 
    REFERENCES device_models(id) 
    ON DELETE CASCADE,
  
  -- 통신사 코드 검증
  CONSTRAINT valid_carrier CHECK (
    carrier IN ('KT', 'SKT', 'LG_U_PLUS')
  ),
  
  -- 용량 코드 검증
  CONSTRAINT valid_storage CHECK (
    storage IN ('128GB', '256GB', '512GB', '1TB')
  ),
  
  -- 가격 검증 (양수)
  CONSTRAINT valid_price CHECK (
    price > 0
  )
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_device_model_id ON products(device_model_id);
CREATE INDEX IF NOT EXISTS idx_products_carrier ON products(carrier);
CREATE INDEX IF NOT EXISTS idx_products_storage ON products(storage);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. RLS 비활성화 (개발용)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 4. 샘플 데이터 삽입 (선택사항)
-- device_models 테이블에 데이터가 있어야 함
INSERT INTO products (store_id, device_model_id, carrier, storage, price, conditions, is_active) 
SELECT 
  gen_random_uuid() as store_id, -- 실제로는 인증된 사용자의 store_id 사용
  dm.id as device_model_id,
  unnest(dm.supported_carriers) as carrier,
  unnest(dm.supported_storage) as storage,
  CASE 
    WHEN dm.manufacturer = 'SAMSUNG' THEN 
      CASE dm.model
        WHEN 'Galaxy S24 Ultra' THEN 1500000
        WHEN 'Galaxy S24+' THEN 1200000
        WHEN 'Galaxy S24' THEN 1000000
        WHEN 'Galaxy Z Fold5' THEN 1800000
        WHEN 'Galaxy Z Flip5' THEN 1300000
        ELSE 1000000
      END
    WHEN dm.manufacturer = 'APPLE' THEN
      CASE dm.model
        WHEN 'iPhone 15 Pro Max' THEN 1600000
        WHEN 'iPhone 15 Pro' THEN 1400000
        WHEN 'iPhone 15 Plus' THEN 1200000
        WHEN 'iPhone 15' THEN 1000000
        WHEN 'iPhone 14 Pro Max' THEN 1300000
        ELSE 1000000
      END
    ELSE 1000000
  END as price,
  ARRAY['번호이동', '신규가입'] as conditions,
  true as is_active
FROM device_models dm
WHERE dm.manufacturer IN ('SAMSUNG', 'APPLE')
LIMIT 20; -- 샘플 데이터 개수 제한
