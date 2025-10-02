-- 데이터 리셋만 수행하는 스크립트
-- 샘플 데이터 삽입 없이 기존 데이터만 삭제
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- ========================================
-- 1단계: 필요한 컬럼 추가
-- ========================================

-- device_models 테이블에 소프트 삭제 컬럼 추가
ALTER TABLE device_models 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- products 테이블에 삭제 관련 컬럼 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(50);

SELECT '1단계 완료: 필요한 컬럼이 추가되었습니다.' as step1_result;

-- ========================================
-- 2단계: 기존 데이터 삭제
-- ========================================

-- 안전하게 데이터 삭제 (존재하는 테이블만)
DELETE FROM reviews WHERE id IS NOT NULL;
DELETE FROM reservations WHERE id IS NOT NULL;
DELETE FROM favorites WHERE id IS NOT NULL;
DELETE FROM product_tables WHERE id IS NOT NULL;
DELETE FROM store_products WHERE id IS NOT NULL;
DELETE FROM products WHERE id IS NOT NULL;
DELETE FROM device_models WHERE id IS NOT NULL;

SELECT '2단계 완료: 기존 데이터가 삭제되었습니다.' as step2_result;

-- ========================================
-- 3단계: 인덱스 생성
-- ========================================

-- device_models 인덱스
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_models_is_deleted ON device_models(is_deleted);
CREATE INDEX IF NOT EXISTS idx_device_models_deleted_at ON device_models(deleted_at);

-- products 인덱스
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_device_model_id ON products(device_model_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deletion_reason ON products(deletion_reason);

SELECT '3단계 완료: 인덱스가 생성되었습니다.' as step3_result;

-- ========================================
-- 4단계: 결과 확인
-- ========================================

-- 삭제된 데이터 확인
SELECT 
  'device_models' as table_name, 
  COUNT(*) as count 
FROM device_models;

SELECT 
  'products' as table_name, 
  COUNT(*) as count 
FROM products;

SELECT 
  'reservations' as table_name, 
  COUNT(*) as count 
FROM reservations;

SELECT 
  'reviews' as table_name, 
  COUNT(*) as count 
FROM reviews;

SELECT 
  'favorites' as table_name, 
  COUNT(*) as count 
FROM favorites;

SELECT '🎉 데이터 리셋이 완료되었습니다! 이제 새로운 데이터를 등록할 수 있습니다.' as final_result;
