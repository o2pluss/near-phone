-- device_models 테이블 스키마 업데이트
-- model 컬럼을 device_name으로 변경하고 model_name 컬럼 추가

-- 1. 기존 데이터 백업 (선택사항)
-- CREATE TABLE device_models_backup AS SELECT * FROM device_models;

-- 2. device_name 컬럼 추가 (model 컬럼의 데이터를 복사)
ALTER TABLE device_models ADD COLUMN device_name VARCHAR(255);

-- 3. model_name 컬럼 추가
ALTER TABLE device_models ADD COLUMN model_name VARCHAR(255);

-- 4. 기존 model 데이터를 device_name으로 복사
UPDATE device_models SET device_name = model;

-- 5. model_name에 기본값 설정 (나중에 수동으로 업데이트 필요)
UPDATE device_models SET model_name = 'MODEL-' || id WHERE model_name IS NULL;

-- 6. device_name을 NOT NULL로 설정
ALTER TABLE device_models ALTER COLUMN device_name SET NOT NULL;

-- 7. model_name을 NOT NULL로 설정
ALTER TABLE device_models ALTER COLUMN model_name SET NOT NULL;

-- 8. 기존 model 컬럼 삭제 (선택사항 - 데이터 확인 후 실행)
-- ALTER TABLE device_models DROP COLUMN model;

-- 9. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_device_models_device_name ON device_models(device_name);
CREATE INDEX IF NOT EXISTS idx_device_models_model_name ON device_models(model_name);

-- 10. 샘플 데이터 업데이트 (기존 데이터가 있는 경우)
-- UPDATE device_models SET 
--   device_name = '갤럭시 S24 Ultra',
--   model_name = 'SM-S928N'
-- WHERE device_name = 'Galaxy S24 Ultra';

-- UPDATE device_models SET 
--   device_name = 'iPhone 15 Pro',
--   model_name = 'A3108'
-- WHERE device_name = 'iPhone 15 Pro';
