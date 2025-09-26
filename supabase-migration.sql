-- Supabase 마이그레이션 SQL
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. 단말기 모델 테이블 생성
CREATE TABLE IF NOT EXISTS device_models (
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

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_models_created_at ON device_models(created_at);
CREATE INDEX IF NOT EXISTS idx_device_models_carriers ON device_models USING GIN(supported_carriers);
CREATE INDEX IF NOT EXISTS idx_device_models_storage ON device_models USING GIN(supported_storage);

-- 3. RLS (Row Level Security) 정책 설정
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "device_models_read_policy" ON device_models
  FOR SELECT USING (true);

-- 인증된 사용자가 생성 가능 (관리자만)
CREATE POLICY "device_models_insert_policy" ON device_models
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자가 수정 가능 (관리자만)
CREATE POLICY "device_models_update_policy" ON device_models
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자가 삭제 가능 (관리자만)
CREATE POLICY "device_models_delete_policy" ON device_models
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. 샘플 데이터 삽입 (선택사항)
INSERT INTO device_models (manufacturer, model, supported_carriers, supported_storage, image_url) VALUES
('SAMSUNG', 'Galaxy S24 Ultra', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null),
('SAMSUNG', 'Galaxy S24+', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('SAMSUNG', 'Galaxy S24', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('SAMSUNG', 'Galaxy Z Fold5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('SAMSUNG', 'Galaxy Z Flip5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB'], null),
('APPLE', 'iPhone 15 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15 Pro', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15 Plus', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('APPLE', 'iPhone 15', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('APPLE', 'iPhone 14 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null)
ON CONFLICT DO NOTHING;

-- 5. 업데이트 시간 자동 갱신을 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 생성
CREATE TRIGGER update_device_models_updated_at 
    BEFORE UPDATE ON device_models 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
