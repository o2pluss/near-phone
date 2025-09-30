-- 기존 favorites 테이블에 컬럼 추가
-- 먼저 기존 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;

-- product_id 컬럼 추가
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;

-- product_snapshot 컬럼 추가
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

-- 기존 UNIQUE 제약조건 삭제 (user_id, store_id만)
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_store_id_key;

-- 새로운 UNIQUE 제약조건 추가 (user_id, store_id, product_id)
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_id_store_id_product_id_key 
UNIQUE(user_id, store_id, product_id);

-- 업데이트된 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;
