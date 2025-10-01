-- stores 테이블에 hours 컬럼 추가

-- hours 컬럼 추가 (JSONB 타입으로 운영시간 정보 저장)
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS hours JSONB DEFAULT '{
  "weekday": "09:00 - 21:00",
  "saturday": "09:00 - 18:00", 
  "sunday": "10:00 - 18:00"
}'::jsonb;

-- 기존 stores 데이터에 기본 hours 값 설정 (NULL인 경우에만)
UPDATE public.stores 
SET hours = '{
  "weekday": "09:00 - 21:00",
  "saturday": "09:00 - 18:00",
  "sunday": "10:00 - 18:00"
}'::jsonb
WHERE hours IS NULL;

-- 컬럼 추가 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name = 'hours';
