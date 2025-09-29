-- 샘플 단말기 데이터 업데이트
-- device_name과 model_name에 실제 값 설정

-- 삼성 갤럭시 시리즈
UPDATE device_models SET 
  device_name = '갤럭시 S24 Ultra',
  model_name = 'SM-S928N'
WHERE manufacturer = 'SAMSUNG' AND (device_name LIKE '%Galaxy S24 Ultra%' OR device_name LIKE '%S24 Ultra%');

UPDATE device_models SET 
  device_name = '갤럭시 S24+',
  model_name = 'SM-S926N'
WHERE manufacturer = 'SAMSUNG' AND (device_name LIKE '%Galaxy S24+%' OR device_name LIKE '%S24+%');

UPDATE device_models SET 
  device_name = '갤럭시 S24',
  model_name = 'SM-S921N'
WHERE manufacturer = 'SAMSUNG' AND (device_name LIKE '%Galaxy S24%' OR device_name LIKE '%S24%') 
  AND device_name NOT LIKE '%S24+%' AND device_name NOT LIKE '%S24 Ultra%';

UPDATE device_models SET 
  device_name = '갤럭시 Z Fold5',
  model_name = 'SM-F946N'
WHERE manufacturer = 'SAMSUNG' AND (device_name LIKE '%Galaxy Z Fold5%' OR device_name LIKE '%Z Fold5%');

UPDATE device_models SET 
  device_name = '갤럭시 Z Flip5',
  model_name = 'SM-F731N'
WHERE manufacturer = 'SAMSUNG' AND (device_name LIKE '%Galaxy Z Flip5%' OR device_name LIKE '%Z Flip5%');

-- 애플 iPhone 시리즈
UPDATE device_models SET 
  device_name = 'iPhone 15 Pro Max',
  model_name = 'A3108'
WHERE manufacturer = 'APPLE' AND (device_name LIKE '%iPhone 15 Pro Max%' OR device_name LIKE '%15 Pro Max%');

UPDATE device_models SET 
  device_name = 'iPhone 15 Pro',
  model_name = 'A3106'
WHERE manufacturer = 'APPLE' AND (device_name LIKE '%iPhone 15 Pro%' OR device_name LIKE '%15 Pro%') 
  AND device_name NOT LIKE '%15 Pro Max%';

UPDATE device_models SET 
  device_name = 'iPhone 15 Plus',
  model_name = 'A3104'
WHERE manufacturer = 'APPLE' AND (device_name LIKE '%iPhone 15 Plus%' OR device_name LIKE '%15 Plus%');

UPDATE device_models SET 
  device_name = 'iPhone 15',
  model_name = 'A3102'
WHERE manufacturer = 'APPLE' AND (device_name LIKE '%iPhone 15%' OR device_name LIKE '%15%') 
  AND device_name NOT LIKE '%15 Pro%' AND device_name NOT LIKE '%15 Plus%';

UPDATE device_models SET 
  device_name = 'iPhone 14 Pro Max',
  model_name = 'A2894'
WHERE manufacturer = 'APPLE' AND (device_name LIKE '%iPhone 14 Pro Max%' OR device_name LIKE '%14 Pro Max%');

-- 업데이트된 데이터 확인
SELECT id, manufacturer, device_name, model_name, supported_carriers, supported_storage 
FROM device_models 
ORDER BY manufacturer, device_name;
