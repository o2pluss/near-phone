-- 간단한 테이블 상태 확인 (Supabase SQL Editor에서 실행)
-- 이 스크립트를 복사해서 Supabase SQL Editor에 붙여넣고 실행하세요

-- 1. 테이블 존재 여부 확인
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') 
        THEN 'device_models 테이블이 존재합니다.'
        ELSE 'device_models 테이블이 존재하지 않습니다.'
    END as table_status;

-- 2. 테이블이 있다면 컬럼 구조 확인
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'device_models' 
ORDER BY ordinal_position;

-- 3. 데이터 개수 확인 (테이블이 있는 경우)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'device_models') 
        THEN (SELECT COUNT(*)::text || '개의 레코드가 있습니다.' FROM device_models)
        ELSE '테이블이 없어서 데이터를 확인할 수 없습니다.'
    END as data_count;
