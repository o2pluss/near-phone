-- 상품 테이블에서 is_active 컬럼 제거
-- 노출기간 필터링만 사용하도록 변경

-- 1. is_active 컬럼 제거
ALTER TABLE product_tables DROP COLUMN IF EXISTS is_active;

-- 2. 관련 인덱스 제거
DROP INDEX IF EXISTS idx_product_tables_is_active;

-- 3. 확인 쿼리
SELECT 
  id,
  name,
  exposure_start_date,
  exposure_end_date,
  created_at,
  updated_at
FROM product_tables 
ORDER BY created_at DESC
LIMIT 5;
