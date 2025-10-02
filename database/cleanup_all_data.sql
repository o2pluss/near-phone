-- 모든 기존 데이터 삭제 스크립트
-- ⚠️ 주의: 이 스크립트는 모든 데이터를 완전히 삭제합니다!
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 먼저 누락된 컬럼들을 추가합니다
-- (이미 실행했다면 이 부분은 건너뛰어도 됩니다)

-- 0. 필요한 컬럼 추가
ALTER TABLE device_models 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(50);

-- 1. 외래키 제약조건을 고려한 삭제 순서
-- (자식 테이블부터 삭제해야 함)
-- 테이블 존재 여부를 확인하고 안전하게 삭제

-- 1-1. 리뷰 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        DELETE FROM reviews;
        RAISE NOTICE 'reviews 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'reviews 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-2. 예약 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservations') THEN
        DELETE FROM reservations;
        RAISE NOTICE 'reservations 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'reservations 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-3. 즐겨찾기 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorites') THEN
        DELETE FROM favorites;
        RAISE NOTICE 'favorites 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'favorites 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-4. 상품 가격 이력 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_price_history') THEN
        DELETE FROM product_price_history;
        RAISE NOTICE 'product_price_history 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'product_price_history 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-5. 상품 상태 이력 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_status_history') THEN
        DELETE FROM product_status_history;
        RAISE NOTICE 'product_status_history 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'product_status_history 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-6. 상품 테이블 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_tables') THEN
        DELETE FROM product_tables;
        RAISE NOTICE 'product_tables 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'product_tables 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-7. 매장 상품 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'store_products') THEN
        DELETE FROM store_products;
        RAISE NOTICE 'store_products 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'store_products 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-8. 상품 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        DELETE FROM products;
        RAISE NOTICE 'products 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'products 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 1-9. 단말기 모델 삭제 (존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') THEN
        DELETE FROM device_models;
        RAISE NOTICE 'device_models 테이블 데이터 삭제 완료';
    ELSE
        RAISE NOTICE 'device_models 테이블이 존재하지 않습니다';
    END IF;
END $$;

-- 2. 시퀀스 리셋 (UUID는 자동 생성되므로 필요 없음)

-- 3. 인덱스 재생성 (성능 최적화)
-- 테이블이 존재하는 경우에만 인덱스 생성

-- 단말기 모델 인덱스
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') THEN
        CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
        CREATE INDEX IF NOT EXISTS idx_device_models_is_deleted ON device_models(is_deleted);
        CREATE INDEX IF NOT EXISTS idx_device_models_deleted_at ON device_models(deleted_at);
        RAISE NOTICE 'device_models 인덱스 생성 완료';
    END IF;
END $$;

-- 상품 인덱스
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
        CREATE INDEX IF NOT EXISTS idx_products_device_model_id ON products(device_model_id);
        CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
        CREATE INDEX IF NOT EXISTS idx_products_deletion_reason ON products(deletion_reason);
        RAISE NOTICE 'products 인덱스 생성 완료';
    END IF;
END $$;

-- 예약 인덱스
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservations') THEN
        CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
        CREATE INDEX IF NOT EXISTS idx_reservations_store_id ON reservations(store_id);
        CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
        RAISE NOTICE 'reservations 인덱스 생성 완료';
    END IF;
END $$;

-- 리뷰 인덱스
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_store_id ON reviews(store_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
        RAISE NOTICE 'reviews 인덱스 생성 완료';
    END IF;
END $$;

-- 즐겨찾기 인덱스
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorites') THEN
        CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_favorites_store_id ON favorites(store_id);
        RAISE NOTICE 'favorites 인덱스 생성 완료';
    END IF;
END $$;

-- 4. 삭제된 단말기 뷰 재생성 (테이블이 존재하는 경우에만)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') THEN
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
        RAISE NOTICE 'deleted_device_models 뷰 생성 완료';
    ELSE
        RAISE NOTICE 'device_models 테이블이 존재하지 않아 뷰를 생성할 수 없습니다';
    END IF;
END $$;

-- 5. 통계 확인 (존재하는 테이블만)
DO $$ 
DECLARE
    device_count INTEGER := 0;
    product_count INTEGER := 0;
    reservation_count INTEGER := 0;
    review_count INTEGER := 0;
    favorite_count INTEGER := 0;
BEGIN
    -- device_models 카운트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') THEN
        SELECT COUNT(*) INTO device_count FROM device_models;
        RAISE NOTICE 'device_models: %개', device_count;
    END IF;
    
    -- products 카운트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        SELECT COUNT(*) INTO product_count FROM products;
        RAISE NOTICE 'products: %개', product_count;
    END IF;
    
    -- reservations 카운트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservations') THEN
        SELECT COUNT(*) INTO reservation_count FROM reservations;
        RAISE NOTICE 'reservations: %개', reservation_count;
    END IF;
    
    -- reviews 카운트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        SELECT COUNT(*) INTO review_count FROM reviews;
        RAISE NOTICE 'reviews: %개', review_count;
    END IF;
    
    -- favorites 카운트
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorites') THEN
        SELECT COUNT(*) INTO favorite_count FROM favorites;
        RAISE NOTICE 'favorites: %개', favorite_count;
    END IF;
END $$;

-- 6. 완료 메시지
SELECT '모든 데이터가 성공적으로 삭제되었습니다. 새로 시작할 수 있습니다.' as message;
