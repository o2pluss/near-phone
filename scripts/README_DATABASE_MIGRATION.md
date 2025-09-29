# 데이터베이스 마이그레이션 가이드

## 개요
`device_models` 테이블에 `device_name`과 `model_name` 컬럼을 추가하여 새로운 데이터 구조로 마이그레이션합니다.

## 단계별 실행 방법

### 1단계: 현재 스키마 확인
Supabase SQL Editor에서 다음 스크립트를 실행하여 현재 테이블 구조를 확인합니다:

```sql
-- device_models 테이블 스키마 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'device_models' 
ORDER BY ordinal_position;
```

### 2단계: 스키마 업데이트
다음 스크립트를 순서대로 실행합니다:

```sql
-- 1. device_name 컬럼 추가
ALTER TABLE device_models ADD COLUMN device_name VARCHAR(255);

-- 2. model_name 컬럼 추가  
ALTER TABLE device_models ADD COLUMN model_name VARCHAR(255);

-- 3. 기존 model 데이터를 device_name으로 복사
UPDATE device_models SET device_name = model;

-- 4. model_name에 기본값 설정
UPDATE device_models SET model_name = 'MODEL-' || id WHERE model_name IS NULL;

-- 5. NOT NULL 제약조건 추가
ALTER TABLE device_models ALTER COLUMN device_name SET NOT NULL;
ALTER TABLE device_models ALTER COLUMN model_name SET NOT NULL;

-- 6. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_device_models_device_name ON device_models(device_name);
CREATE INDEX IF NOT EXISTS idx_device_models_model_name ON device_models(model_name);
```

### 3단계: 샘플 데이터 업데이트
실제 deviceName과 modelName 값으로 업데이트합니다:

```sql
-- 삼성 갤럭시 시리즈
UPDATE device_models SET 
  device_name = '갤럭시 S24 Ultra',
  model_name = 'SM-S928N'
WHERE manufacturer = 'SAMSUNG' AND device_name LIKE '%Galaxy S24 Ultra%';

-- 애플 iPhone 시리즈  
UPDATE device_models SET 
  device_name = 'iPhone 15 Pro',
  model_name = 'A3106'
WHERE manufacturer = 'APPLE' AND device_name LIKE '%iPhone 15 Pro%';

-- 더 많은 업데이트는 update-sample-device-data.sql 파일 참조
```

### 4단계: API 테스트
터미널에서 다음 명령어로 API가 정상 작동하는지 테스트합니다:

```bash
# Node.js가 설치되어 있어야 합니다
node scripts/test-device-models-api.js
```

### 5단계: 프론트엔드 확인
1. 브라우저에서 `http://localhost:3000/admin` 접속
2. 단말기 관리 메뉴에서 데이터가 정상 표시되는지 확인
3. 새 단말기 추가/수정 기능 테스트
4. 판매자 상품 관리에서 모델 선택 기능 테스트

## 롤백 방법
문제가 발생한 경우 다음 스크립트로 롤백할 수 있습니다:

```sql
-- 새로 추가된 컬럼 삭제
ALTER TABLE device_models DROP COLUMN IF EXISTS device_name;
ALTER TABLE device_models DROP COLUMN IF EXISTS model_name;

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_device_models_device_name;
DROP INDEX IF EXISTS idx_device_models_model_name;
```

## 주의사항
- 마이그레이션 전에 데이터베이스 백업을 권장합니다
- 프로덕션 환경에서는 점진적 마이그레이션을 고려하세요
- API는 이미 fallback 로직이 구현되어 있어 마이그레이션 전에도 정상 작동합니다

## 문제 해결
- **컬럼이 이미 존재하는 경우**: `IF NOT EXISTS` 구문을 사용하거나 기존 컬럼을 확인 후 진행
- **데이터 타입 오류**: VARCHAR 길이를 조정하거나 데이터 형식을 확인
- **제약조건 오류**: NULL 값이 있는 경우 먼저 데이터를 업데이트한 후 NOT NULL 제약조건 추가
