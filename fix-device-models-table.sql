-- device_models 테이블 생성 및 샘플 데이터 삽입
-- Supabase SQL Editor에서 실행하세요

-- 1. 테이블 생성 (프론트엔드 인터페이스와 일치)
CREATE TABLE IF NOT EXISTS device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL,
  model VARCHAR(100), -- NULL 허용으로 변경 (프론트엔드에서 사용하지 않음)
  device_name VARCHAR(100) NOT NULL, -- NOT NULL로 변경 (프론트엔드에서 주로 사용)
  model_name VARCHAR(100) NOT NULL,  -- NOT NULL로 변경 (프론트엔드에서 주로 사용)
  supported_carriers TEXT[] NOT NULL,
  supported_storage TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기존 테이블이 있다면 스키마 업데이트
-- model 필드를 NULL 허용으로 변경
ALTER TABLE device_models ALTER COLUMN model DROP NOT NULL;

-- device_name과 model_name을 NOT NULL로 변경 (기존 데이터가 있다면)
UPDATE device_models SET device_name = COALESCE(device_name, model, 'Unknown Device') WHERE device_name IS NULL;
UPDATE device_models SET model_name = COALESCE(model_name, model, 'Unknown Model') WHERE model_name IS NULL;

ALTER TABLE device_models ALTER COLUMN device_name SET NOT NULL;
ALTER TABLE device_models ALTER COLUMN model_name SET NOT NULL;

-- 3. RLS 비활성화 (개발용)
ALTER TABLE device_models DISABLE ROW LEVEL SECURITY;

-- 3. 샘플 데이터 삽입
INSERT INTO device_models (manufacturer, model, device_name, model_name, supported_carriers, supported_storage, image_url) VALUES
('SAMSUNG', 'Galaxy S24 Ultra', 'Galaxy S24 Ultra', 'SM-S928', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], 'https://example.com/galaxy-s24-ultra.jpg'),
('SAMSUNG', 'Galaxy S24+', 'Galaxy S24+', 'SM-S926', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], 'https://example.com/galaxy-s24-plus.jpg'),
('SAMSUNG', 'Galaxy S24', 'Galaxy S24', 'SM-S921', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], 'https://example.com/galaxy-s24.jpg'),
('SAMSUNG', 'Galaxy Z Fold5', 'Galaxy Z Fold5', 'SM-F946', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], 'https://example.com/galaxy-z-fold5.jpg'),
('SAMSUNG', 'Galaxy Z Flip5', 'Galaxy Z Flip5', 'SM-F731', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB'], 'https://example.com/galaxy-z-flip5.jpg'),
('APPLE', 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', 'A3108', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], 'https://example.com/iphone-15-pro-max.jpg'),
('APPLE', 'iPhone 15 Pro', 'iPhone 15 Pro', 'A3102', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], 'https://example.com/iphone-15-pro.jpg'),
('APPLE', 'iPhone 15 Plus', 'iPhone 15 Plus', 'A3106', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], 'https://example.com/iphone-15-plus.jpg'),
('APPLE', 'iPhone 15', 'iPhone 15', 'A3104', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], 'https://example.com/iphone-15.jpg'),
('APPLE', 'iPhone 14 Pro Max', 'iPhone 14 Pro Max', 'A2896', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], 'https://example.com/iphone-14-pro-max.jpg')
ON CONFLICT DO NOTHING;

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_models_created_at ON device_models(created_at);
CREATE INDEX IF NOT EXISTS idx_device_models_carriers ON device_models USING GIN(supported_carriers);
CREATE INDEX IF NOT EXISTS idx_device_models_storage ON device_models USING GIN(supported_storage);
