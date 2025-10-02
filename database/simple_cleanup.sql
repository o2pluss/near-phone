-- 간단한 데이터 정리 스크립트
-- 존재하는 테이블의 데이터만 안전하게 삭제
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 단말기 모델 데이터 삭제 (존재하는 경우에만)
DELETE FROM device_models WHERE id IS NOT NULL;

-- 2. 상품 데이터 삭제 (존재하는 경우에만)
DELETE FROM products WHERE id IS NOT NULL;

-- 3. 예약 데이터 삭제 (존재하는 경우에만)
DELETE FROM reservations WHERE id IS NOT NULL;

-- 4. 리뷰 데이터 삭제 (존재하는 경우에만)
DELETE FROM reviews WHERE id IS NOT NULL;

-- 5. 즐겨찾기 데이터 삭제 (존재하는 경우에만)
DELETE FROM favorites WHERE id IS NOT NULL;

-- 6. 상품 테이블 데이터 삭제 (존재하는 경우에만)
DELETE FROM product_tables WHERE id IS NOT NULL;

-- 7. 매장 상품 데이터 삭제 (존재하는 경우에만)
DELETE FROM store_products WHERE id IS NOT NULL;

-- 완료 메시지
SELECT '데이터 정리가 완료되었습니다.' as message;
