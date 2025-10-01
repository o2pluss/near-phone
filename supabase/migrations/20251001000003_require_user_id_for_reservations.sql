-- reservations 테이블의 user_id를 다시 NOT NULL로 변경
-- 인증된 사용자만 예약 가능하도록 제한

-- 먼저 기존의 NULL user_id를 가진 예약들을 삭제 (테스트 데이터)
DELETE FROM public.reservations WHERE user_id IS NULL;

-- user_id를 NOT NULL로 변경
ALTER TABLE public.reservations 
ALTER COLUMN user_id SET NOT NULL;

-- 코멘트 업데이트
COMMENT ON COLUMN public.reservations.user_id IS '사용자 ID (필수 - 인증된 사용자만 예약 가능)';
