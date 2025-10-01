-- reservations 테이블에서 no_show 상태 제거
-- 기존 데이터가 있다면 completed로 변경

-- no_show 상태인 예약들을 completed로 변경
UPDATE public.reservations 
SET status = 'completed' 
WHERE status = 'no_show';

-- check constraint 수정하여 no_show 상태 제거
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'cancel_pending'));
