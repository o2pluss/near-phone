-- 샘플 데이터 삽입 스크립트
-- 테스트용 단말기 모델과 상품 데이터를 생성합니다
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 샘플 단말기 모델 데이터 삽입
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
('SAMSUNG', 'Galaxy S24 Ultra', 'S24 Ultra', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy S24+', 'S24 Plus', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24-plus/images/galaxy-s24-plus-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy S24', 'S24', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-s24/images/galaxy-s24-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy Z Fold5', 'Z Fold5', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-z-fold5/images/galaxy-z-fold5-highlights-kv.jpg'),

('SAMSUNG', 'Galaxy Z Flip5', 'Z Flip5', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB'], 
 'https://images.samsung.com/kr/smartphones/galaxy-z-flip5/images/galaxy-z-flip5-highlights-kv.jpg'),

-- 애플 아이폰 시리즈
('APPLE', 'iPhone 15 Pro Max', '15 Pro Max', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15 Pro', '15 Pro', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15 Plus', '15 Plus', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-plus-finish-select-202309-6-7inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 15', '15', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1693009279822'),

('APPLE', 'iPhone 14 Pro Max', '14 Pro Max', 
 ARRAY['KT', 'SKT', 'LG_U_PLUS'], 
 ARRAY['128GB', '256GB', '512GB', '1TB'], 
 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deep-purple?wid=5120&hei=3280&fmt=p-jpg&qlt=80&.v=1663703841892');

-- 2. 샘플 매장 데이터 (stores 테이블이 있다면)
-- INSERT INTO stores (name, business_name, address, phone_number, seller_id) VALUES
-- ('테스트매장1', '테스트매장1', '서울시 강남구 테헤란로 123', '02-1234-5678', 'test-seller-id-1'),
-- ('테스트매장2', '테스트매장2', '서울시 서초구 서초대로 456', '02-2345-6789', 'test-seller-id-2');

-- 3. 삽입된 데이터 확인
SELECT 
  'device_models' as table_name, 
  COUNT(*) as count 
FROM device_models;

-- 4. 단말기 모델 목록 조회
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

-- 5. 완료 메시지
SELECT '샘플 단말기 모델 데이터가 성공적으로 삽입되었습니다.' as message;
