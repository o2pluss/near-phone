-- 기존 device_models 테이블을 새로운 스키마로 마이그레이션하는 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 백업 (선택사항)
CREATE TABLE IF NOT EXISTS device_models_backup AS 
SELECT * FROM device_models;

-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS device_models CASCADE;

-- 3. 새로운 스키마로 테이블 생성
CREATE TABLE device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL,
  model VARCHAR(100) NOT NULL,
  supported_carriers TEXT[] NOT NULL,
  supported_storage TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제조사 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_manufacturer CHECK (
    manufacturer IN ('SAMSUNG', 'APPLE')
  ),
  
  -- 통신사 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_carrier_codes CHECK (
    supported_carriers <@ ARRAY['KT', 'SKT', 'LG_U_PLUS']::TEXT[]
  ),
  
  -- 용량 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_storage_codes CHECK (
    supported_storage <@ ARRAY['128GB', '256GB', '512GB', '1TB']::TEXT[]
  )
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_models_created_at ON device_models(created_at);
CREATE INDEX IF NOT EXISTS idx_device_models_carriers ON device_models USING GIN(supported_carriers);
CREATE INDEX IF NOT EXISTS idx_device_models_storage ON device_models USING GIN(supported_storage);

-- 5. RLS 비활성화 (개발용)
ALTER TABLE device_models DISABLE ROW LEVEL SECURITY;

-- 6. 백업 데이터가 있다면 새로운 스키마로 변환하여 복원
-- (기존 데이터가 있다면 이 부분을 실행하세요)
INSERT INTO device_models (id, manufacturer, model, supported_carriers, supported_storage, image_url, created_at, updated_at)
SELECT 
  id,
  COALESCE(manufacturer_code, 'SAMSUNG') as manufacturer,
  model,
  COALESCE(supported_carrier_codes, ARRAY[]::TEXT[]) as supported_carriers,
  -- 허용되지 않는 값들을 필터링
  ARRAY(
    SELECT storage
    FROM unnest(COALESCE(supported_storage_codes, ARRAY[]::TEXT[])) as storage
    WHERE storage IN ('128GB', '256GB', '512GB', '1TB')
  ) as supported_storage,
  image_url,
  COALESCE(created_at, NOW()) as created_at,
  COALESCE(updated_at, NOW()) as updated_at
FROM device_models_backup
WHERE EXISTS (SELECT 1 FROM device_models_backup LIMIT 1);

-- 7. 백업 테이블 삭제 (선택사항)
-- DROP TABLE IF EXISTS device_models_backup;

-- 8. 샘플 데이터 삽입 (기존 데이터가 없는 경우)
INSERT INTO device_models (manufacturer, model, supported_carriers, supported_storage) VALUES
('SAMSUNG', 'Galaxy S24 Ultra', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB']),
('SAMSUNG', 'Galaxy S24+', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB']),
('SAMSUNG', 'Galaxy S24', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB']),
('SAMSUNG', 'Galaxy Z Fold5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB']),
('SAMSUNG', 'Galaxy Z Flip5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB']),
('APPLE', 'iPhone 15 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB']),
('APPLE', 'iPhone 15 Pro', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB']),
('APPLE', 'iPhone 15 Plus', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB']),
('APPLE', 'iPhone 15', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB']),
('APPLE', 'iPhone 14 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'])
ON CONFLICT (id) DO NOTHING;
