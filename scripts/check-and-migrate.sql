-- 기존 테이블 상태 확인 및 마이그레이션 안내 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 존재 여부 확인
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- device_models 테이블이 존재하는지 확인
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') THEN
        RAISE NOTICE 'device_models 테이블이 존재합니다.';
        
        -- 기존 테이블의 컬럼 구조 확인
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'device_models' AND column_name = 'manufacturer_code') THEN
            RAISE NOTICE '기존 스키마를 사용 중입니다. (manufacturer_code, supported_carrier_codes, supported_storage_codes)';
            RAISE NOTICE '마이그레이션이 필요합니다. migrate-device-models-table.sql을 실행하세요.';
        ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'device_models' AND column_name = 'manufacturer') THEN
            RAISE NOTICE '새로운 스키마를 사용 중입니다. (manufacturer, supported_carriers, supported_storage)';
            RAISE NOTICE '마이그레이션이 필요하지 않습니다.';
        ELSE
            RAISE NOTICE '알 수 없는 스키마입니다. 테이블 구조를 확인해주세요.';
        END IF;
        
        -- 기존 데이터 개수 확인
        EXECUTE 'SELECT COUNT(*) FROM device_models' INTO STRICT table_count;
        RAISE NOTICE '기존 데이터 개수: %', table_count;
        
    ELSE
        RAISE NOTICE 'device_models 테이블이 존재하지 않습니다.';
        RAISE NOTICE '새로 생성이 필요합니다. create-device-models-table.sql을 실행하세요.';
    END IF;
END $$;

-- 2. 현재 테이블 구조 확인 (참고용)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'device_models' 
ORDER BY ordinal_position;
