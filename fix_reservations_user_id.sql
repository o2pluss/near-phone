-- reservations 테이블의 user_id를 NULL 허용으로 변경
ALTER TABLE public.reservations 
ALTER COLUMN user_id DROP NOT NULL;

-- user_id가 NULL인 경우를 위한 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_reservations_user_nullable ON public.reservations(user_id) WHERE user_id IS NOT NULL;
