-- 소프트 삭제를 위한 데이터베이스 스키마 수정
-- 실행 전 백업 권장

-- 1. products 테이블에 삭제 관련 필드 추가
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 2. product_tables 테이블에도 삭제 관련 필드 추가
ALTER TABLE product_tables 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 3. 삭제 관련 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_deletion_reason ON products(deletion_reason);
CREATE INDEX IF NOT EXISTS idx_product_tables_deleted_at ON product_tables(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_tables_deletion_reason ON product_tables(deletion_reason);

-- 4. 복합 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_products_active_deleted ON products(is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_tables_active_deleted ON product_tables(is_active, deleted_at);

-- 5. 기존 데이터 정리 (is_active가 false인 데이터에 deleted_at 설정)
UPDATE products 
SET deleted_at = updated_at 
WHERE is_active = false AND deleted_at IS NULL;

UPDATE product_tables 
SET deleted_at = updated_at 
WHERE is_active = false AND deleted_at IS NULL;

-- 6. 삭제 관련 뷰 생성 (관리자용)
CREATE OR REPLACE VIEW deleted_products AS
SELECT 
    p.*,
    pt.name as table_name,
    s.name as store_name
FROM products p
LEFT JOIN product_tables pt ON p.table_id = pt.id
LEFT JOIN stores s ON p.store_id = s.id
WHERE p.is_active = false OR p.deleted_at IS NOT NULL;

CREATE OR REPLACE VIEW deleted_product_tables AS
SELECT 
    pt.*,
    s.name as store_name,
    COUNT(p.id) as deleted_products_count
FROM product_tables pt
LEFT JOIN stores s ON pt.store_id = s.id
LEFT JOIN products p ON pt.id = p.table_id AND (p.is_active = false OR p.deleted_at IS NOT NULL)
WHERE pt.is_active = false OR pt.deleted_at IS NOT NULL
GROUP BY pt.id, s.name;

-- 7. 정기적 하드 삭제를 위한 함수 생성
CREATE OR REPLACE FUNCTION cleanup_old_deleted_data()
RETURNS void AS $$
BEGIN
    -- 1년 이상 된 삭제된 상품들을 완전 삭제
    DELETE FROM products 
    WHERE is_active = false 
    AND deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 year';
    
    -- 1년 이상 된 삭제된 상품 테이블들을 완전 삭제
    DELETE FROM product_tables 
    WHERE is_active = false 
    AND deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '1 year';
    
    -- 로그 기록
    INSERT INTO system_logs (action, details, created_at) 
    VALUES ('cleanup_old_deleted_data', 'Cleaned up old deleted products and tables', NOW());
END;
$$ LANGUAGE plpgsql;

-- 8. 시스템 로그 테이블 생성 (정리 작업 기록용)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 정기적 정리 작업을 위한 스케줄러 설정 (PostgreSQL 확장 필요)
-- pg_cron 확장이 설치되어 있다면 주석 해제
-- SELECT cron.schedule('cleanup-deleted-data', '0 2 * * 0', 'SELECT cleanup_old_deleted_data();');

COMMENT ON COLUMN products.deleted_at IS '소프트 삭제된 날짜';
COMMENT ON COLUMN products.deletion_reason IS '삭제 사유';
COMMENT ON COLUMN product_tables.deleted_at IS '소프트 삭제된 날짜';
COMMENT ON COLUMN product_tables.deletion_reason IS '삭제 사유';
