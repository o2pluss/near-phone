-- 단계별 데이터베이스 리셋 스크립트
-- Supabase 대시보드의 SQL Editor에서 순서대로 실행하세요

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
-- 4단계: 샘플 데이터 삽입
-- ========================================

-- 샘플 단말기 모델 데이터 삽입
INSERT INTO device_models (
  manufacturer,
  model,
  device_name,
  model_name,
  supported_carriers,
  supported_storage,
  image_url
) VALUES 
-- 삼성 갤럭시 시리즈
('SAMSUNG', 'Galaxy S24 Ultra', 'Galaxy S24 Ultra', 'S24 Ultra', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy S24+', 'Galaxy S24+', 'S24 Plus', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24-plus/images/galaxy-s24-plus-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy S24', 'Galaxy S24', 'S24', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24/images/galaxy-s24-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy Z Fold5', 'Galaxy Z Fold5', 'Z Fold5', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-z-fold5/images/galaxy-z-fold5-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy Z Flip5', 'Galaxy Z Flip5', 'Z Flip5', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-z-flip5/images/galaxy-z-flip5-highlights-kv.jpg'),

-- 애플 아이폰 시리즈
('APPLE', 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', '15 Pro Max', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15 Pro', 'iPhone 15 Pro', '15 Pro', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15 Plus', 'iPhone 15 Plus', '15 Plus', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-plus-finish-select-202309-6-7inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15', 'iPhone 15', '15', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 14 Pro Max', 'iPhone 14 Pro Max', '14 Pro Max', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deep-purple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841892');

SELECT '4단계 완료: 샘플 데이터가 삽입되었습니다.' as step4_result;

-- ========================================
-- 5단계: 결과 확인
-- ========================================

-- 삽입된 데이터 확인
SELECT 
  'device_models' as table_name, 
  COUNT(*) as count 
FROM device_models;

-- 단말기 모델 목록 조회
SELECT 
  id,
  manufacturer,
  device_name,
  model_name,
  supported_carriers,
  supported_storage,
  created_at
FROM device_models 
ORDER BY manufacturer, device_name;

SELECT '🎉 모든 단계가 완료되었습니다! 이제 테스트를 시작할 수 있습니다.' as final_result;
