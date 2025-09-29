-- model 컬럼 제약조건 수정 또는 삭제
-- device_name과 model_name이 추가된 후 model 컬럼 처리

-- 옵션 1: model 컬럼을 NULL 허용으로 변경
ALTER TABLE device_models ALTER COLUMN model DROP NOT NULL;

-- 옵션 2: model 컬럼에 기본값 설정
-- ALTER TABLE device_models ALTER COLUMN model SET DEFAULT '';

-- 옵션 3: model 컬럼 완전 삭제 (데이터 확인 후 실행)
-- ALTER TABLE device_models DROP COLUMN model;

-- 현재 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'device_models' 
ORDER BY ordinal_position;
