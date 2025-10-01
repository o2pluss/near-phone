-- favorites 테이블에 product_id와 product_snapshot 컬럼 추가

-- product_id 컬럼 추가
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE;

-- product_snapshot 컬럼 추가
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

-- 기존 UNIQUE 제약조건 삭제 (user_id, store_id만)
ALTER TABLE public.favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_store_id_key;

-- 새로운 UNIQUE 제약조건 추가 (user_id, store_id, product_id)
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_user_id_store_id_product_id_key 
UNIQUE(user_id, store_id, product_id);

-- updated_at 컬럼 추가
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 업데이트 시간 자동 갱신을 위한 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
