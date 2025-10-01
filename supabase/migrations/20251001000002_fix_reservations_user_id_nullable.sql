-- reservations 테이블의 user_id를 NULL 허용으로 변경
-- 비회원 예약을 허용하기 위해 user_id를 선택적으로 만들기

ALTER TABLE public.reservations 
ALTER COLUMN user_id DROP NOT NULL;

-- user_id가 NULL인 경우를 위한 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_reservations_user_nullable ON public.reservations(user_id) WHERE user_id IS NOT NULL;

-- 코멘트 추가
COMMENT ON COLUMN public.reservations.user_id IS '사용자 ID (NULL 허용 - 비회원 예약 가능)';
