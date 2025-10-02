-- 누락된 컬럼 추가 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. device_models 테이블에 소프트 삭제 컬럼 추가
ALTER TABLE device_models 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. products 테이블에 삭제 관련 컬럼 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(50);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_models_is_deleted ON device_models(is_deleted);
CREATE INDEX IF NOT EXISTS idx_device_models_deleted_at ON device_models(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deletion_reason ON products(deletion_reason);

-- 4. 완료 메시지
SELECT '누락된 컬럼들이 성공적으로 추가되었습니다.' as message;
