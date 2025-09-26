-- 간단한 device_models 테이블 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 테이블 생성 (프론트엔드 인터페이스와 일치)
CREATE TABLE IF NOT EXISTS device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL,
  model VARCHAR(100) NOT NULL,
  supported_carriers TEXT[] NOT NULL,
  supported_storage TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 비활성화 (개발용)
ALTER TABLE device_models DISABLE ROW LEVEL SECURITY;

-- 3. 샘플 데이터 삽입
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
ON CONFLICT DO NOTHING;
