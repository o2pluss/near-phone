-- device_models 테이블 스키마 수정
-- 실서버에서 실행하여 PUT/DELETE 오류 해결

-- 1. device_name 컬럼이 없으면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'device_name'
    ) THEN
        ALTER TABLE device_models ADD COLUMN device_name VARCHAR(100);
    END IF;
END $$;

-- 2. model_name 컬럼이 없으면 추가
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'model_name'
    ) THEN
        ALTER TABLE device_models ADD COLUMN model_name VARCHAR(100);
    END IF;
END $$;

-- 3. 기존 데이터에 대한 기본값 설정
UPDATE device_models 
SET device_name = COALESCE(device_name, model, 'Unknown Device') 
WHERE device_name IS NULL;

UPDATE device_models 
SET model_name = COALESCE(model_name, model, 'Unknown Model') 
WHERE model_name IS NULL;

-- 4. NOT NULL 제약조건 추가 (기존 데이터가 있으므로)
ALTER TABLE device_models ALTER COLUMN device_name SET NOT NULL;
ALTER TABLE device_models ALTER COLUMN model_name SET NOT NULL;

-- 5. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_device_models_device_name ON device_models(device_name);
CREATE INDEX IF NOT EXISTS idx_device_models_model_name ON device_models(model_name);

-- 6. RLS 비활성화 (개발용)
ALTER TABLE device_models DISABLE ROW LEVEL SECURITY;

-- 7. 스키마 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'device_models' 
ORDER BY ordinal_position;
