-- 리뷰 테이블 RLS 정책 추가

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS p_reviews_read ON public.reviews;
DROP POLICY IF EXISTS p_reviews_insert ON public.reviews;
DROP POLICY IF EXISTS p_reviews_update ON public.reviews;
DROP POLICY IF EXISTS p_reviews_delete ON public.reviews;

-- 리뷰 읽기 정책: 모든 사용자가 활성 리뷰를 읽을 수 있음
CREATE POLICY p_reviews_read ON public.reviews
    FOR SELECT
    USING (status = 'active');

-- 리뷰 생성 정책: 인증된 사용자만 리뷰를 생성할 수 있음
CREATE POLICY p_reviews_insert ON public.reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND status = 'active'
    );

-- 리뷰 수정 정책: 본인의 리뷰만 수정할 수 있음
CREATE POLICY p_reviews_update ON public.reviews
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND status = 'active'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND status = 'active'
    );

-- 리뷰 삭제 정책: 본인의 리뷰만 삭제할 수 있음 (소프트 삭제)
CREATE POLICY p_reviews_delete ON public.reviews
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND status = 'active'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
        AND status = 'deleted'
    );

-- 관리자는 모든 리뷰를 관리할 수 있도록 추가 정책
CREATE POLICY p_reviews_admin_all ON public.reviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 판매자는 자신의 매장 리뷰를 읽을 수 있도록 추가 정책
CREATE POLICY p_reviews_seller_read ON public.reviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores 
            WHERE id = store_id 
            AND seller_id = auth.uid()
        )
    );
