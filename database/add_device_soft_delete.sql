-- 단말기 모델 소프트 삭제를 위한 컬럼 추가
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. device_models 테이블에 소프트 삭제 컬럼 추가
ALTER TABLE device_models 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_device_models_is_deleted ON device_models(is_deleted);
CREATE INDEX IF NOT EXISTS idx_device_models_deleted_at ON device_models(deleted_at);

-- 3. products 테이블에 삭제 사유 컬럼 추가 (이미 있을 수 있음)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(50);

-- 4. products 테이블에 삭제 사유 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_deletion_reason ON products(deletion_reason);

-- 5. 삭제된 단말기 모델 조회를 위한 뷰 생성
CREATE OR REPLACE VIEW deleted_device_models AS
SELECT 
  id,
  manufacturer,
  device_name,
  model_name,
  supported_carriers,
  supported_storage,
  image_url,
  deleted_at,
  created_at
FROM device_models 
WHERE is_deleted = true
ORDER BY deleted_at DESC;

-- 6. RLS 정책 업데이트 (선택사항)
-- 관리자는 삭제된 항목도 볼 수 있도록 정책 추가 가능
