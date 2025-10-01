-- 매장 평점 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_store_rating(p_store_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    avg_rating numeric;
    review_count integer;
BEGIN
    -- 해당 매장의 활성 리뷰들의 평균 평점과 개수 계산
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews 
    WHERE store_id = p_store_id 
    AND status = 'active';
    
    -- 매장 테이블의 평점과 리뷰 수 업데이트
    UPDATE public.stores 
    SET 
        rating = avg_rating,
        review_count = review_count,
        updated_at = now()
    WHERE id = p_store_id;
END;
$$;

-- 리뷰 생성/수정/삭제 시 자동으로 매장 평점을 업데이트하는 트리거 함수
CREATE OR REPLACE FUNCTION trigger_update_store_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    target_store_id uuid;
BEGIN
    -- 리뷰가 삽입되거나 수정되거나 삭제될 때
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        -- 삽입/수정의 경우 NEW.store_id 사용, 삭제의 경우 OLD.store_id 사용
        IF TG_OP = 'DELETE' THEN
            target_store_id := OLD.store_id;
        ELSE
            target_store_id := NEW.store_id;
        END IF;
        
        PERFORM update_store_rating(target_store_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 리뷰 테이블에 트리거 생성
DROP TRIGGER IF EXISTS trigger_reviews_update_store_rating ON public.reviews;
CREATE TRIGGER trigger_reviews_update_store_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_store_rating();

-- 기존 매장들의 평점을 업데이트 (초기 데이터 정리)
DO $$
DECLARE
    store_record RECORD;
BEGIN
    FOR store_record IN SELECT stores.id FROM public.stores LOOP
        PERFORM update_store_rating(store_record.id);
    END LOOP;
END $$;
