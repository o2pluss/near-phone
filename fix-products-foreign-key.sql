-- products 테이블의 외래키를 stores 테이블로 변경

-- 1. 기존 외래키 제약조건 삭제
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_store_id_fkey;

-- 2. 새로운 외래키 제약조건 추가 (stores 테이블 참조)
ALTER TABLE products 
ADD CONSTRAINT products_store_id_fkey 
FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;

-- 3. stores 테이블이 존재하는지 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'stores'
);

-- 4. stores 테이블의 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;
