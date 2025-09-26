# 데이터베이스 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성

### 1.2 SQL Editor 열기
1. 왼쪽 메뉴에서 "SQL Editor" 클릭
2. "New query" 버튼 클릭

## 2. 기존 테이블 상태 확인

### 2.1 테이블 존재 여부 확인
먼저 기존 테이블이 있는지 확인하세요:

**방법 1: 간단한 확인**
1. `scripts/simple-check.sql` 파일을 열어서 내용을 복사
2. Supabase SQL Editor에 붙여넣고 실행

**방법 2: 상세한 확인**
1. `scripts/check-and-migrate.sql` 파일을 열어서 내용을 복사
2. Supabase SQL Editor에 붙여넣고 실행

**결과에 따른 다음 단계:**
- **테이블이 없음**: 3.1절 참조 (새 테이블 생성)
- **기존 스키마 사용 중**: 3.2절 참조 (마이그레이션 실행)  
- **새로운 스키마 사용 중**: 추가 작업 불필요

## 3. 데이터베이스 스키마 생성/마이그레이션

### 3.1 새로운 테이블 생성 (기존 테이블이 없는 경우)
다음 SQL을 복사하여 SQL Editor에 붙여넣고 실행하세요:

```sql
-- 1. 단말기 모델 테이블 생성
CREATE TABLE IF NOT EXISTS device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL,
  model VARCHAR(100) NOT NULL,
  supported_carriers TEXT[] NOT NULL,
  supported_storage TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제조사 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_manufacturer CHECK (
    manufacturer IN ('SAMSUNG', 'APPLE')
  ),
  
  -- 통신사 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_carrier_codes CHECK (
    supported_carriers <@ ARRAY['KT', 'SKT', 'LG_U_PLUS']::TEXT[]
  ),
  
  -- 용량 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_storage_codes CHECK (
    supported_storage <@ ARRAY['128GB', '256GB', '512GB', '1TB']::TEXT[]
  )
);
```

### 3.2 기존 테이블 마이그레이션 (기존 스키마를 사용 중인 경우)
기존 데이터를 보존하면서 새로운 스키마로 마이그레이션하세요:

1. `scripts/migrate-device-models-table.sql` 파일을 열어서 내용을 복사
2. Supabase SQL Editor에 붙여넣고 실행

**주의사항:**
- 기존 데이터가 백업됩니다 (`device_models_backup` 테이블)
- 기존 테이블이 삭제되고 새로운 스키마로 재생성됩니다
- 백업된 데이터가 새로운 스키마로 변환되어 복원됩니다

### 3.3 인덱스 생성
```sql
-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_models_created_at ON device_models(created_at);
CREATE INDEX IF NOT EXISTS idx_device_models_carriers ON device_models USING GIN(supported_carriers);
CREATE INDEX IF NOT EXISTS idx_device_models_storage ON device_models USING GIN(supported_storage);
```

### 3.4 RLS (Row Level Security) 정책 설정
```sql
-- RLS 활성화
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "device_models_read_policy" ON device_models
  FOR SELECT USING (true);

-- 인증된 사용자가 생성 가능 (관리자만)
CREATE POLICY "device_models_insert_policy" ON device_models
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자가 수정 가능 (관리자만)
CREATE POLICY "device_models_update_policy" ON device_models
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자가 삭제 가능 (관리자만)
CREATE POLICY "device_models_delete_policy" ON device_models
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 2.4 업데이트 시간 자동 갱신 함수 생성
```sql
-- 업데이트 시간 자동 갱신을 위한 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_device_models_updated_at 
    BEFORE UPDATE ON device_models 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 3.5 샘플 데이터 삽입 (선택사항)
```sql
-- 샘플 데이터 삽입
INSERT INTO device_models (manufacturer, model, supported_carriers, supported_storage, image_url) VALUES
('SAMSUNG', 'Galaxy S24 Ultra', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null),
('SAMSUNG', 'Galaxy S24+', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('SAMSUNG', 'Galaxy S24', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('SAMSUNG', 'Galaxy Z Fold5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('SAMSUNG', 'Galaxy Z Flip5', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB'], null),
('APPLE', 'iPhone 15 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15 Pro', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15 Plus', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('APPLE', 'iPhone 15', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('APPLE', 'iPhone 14 Pro Max', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null)
ON CONFLICT DO NOTHING;
```

## 3. 환경 변수 확인

### 3.1 .env.local 파일 확인
프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, Supabase 연결 정보가 올바른지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 Supabase 연결 정보 확인
1. Supabase 대시보드에서 "Settings" > "API" 메뉴로 이동
2. "Project URL"과 "anon public" 키를 복사
3. `.env.local` 파일에 올바르게 설정되어 있는지 확인

## 4. 테이블 생성 확인

### 4.1 Table Editor에서 확인
1. Supabase 대시보드에서 "Table Editor" 메뉴 클릭
2. `device_models` 테이블이 생성되었는지 확인
3. 샘플 데이터가 삽입되었는지 확인

### 4.2 API 테스트
1. 브라우저에서 `http://localhost:3000/api/device-models` 접속
2. JSON 형태의 단말기 목록이 반환되는지 확인

## 5. 문제 해결

### 5.1 테이블이 생성되지 않는 경우
- SQL 문법 오류가 있는지 확인
- Supabase 프로젝트 권한이 있는지 확인
- SQL Editor에서 오류 메시지 확인

### 5.2 API가 작동하지 않는 경우
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 상태 확인

### 5.3 RLS 정책 문제
- RLS가 활성화되어 있어도 인증되지 않은 사용자는 데이터에 접근할 수 없습니다
- 개발 중에는 RLS를 비활성화하거나 모든 사용자에게 접근 권한을 부여할 수 있습니다

## 6. 개발용 RLS 비활성화 (선택사항)

개발 중에 RLS 정책으로 인한 문제를 피하려면 다음 SQL을 실행하세요:

```sql
-- RLS 비활성화 (개발용)
ALTER TABLE device_models DISABLE ROW LEVEL SECURITY;
```

⚠️ **주의**: 프로덕션 환경에서는 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

## 4. 마이그레이션 요약

### 4.1 빠른 마이그레이션 가이드

**1단계: 현재 상태 확인**
1. `scripts/check-and-migrate.sql` 파일 내용을 복사
2. Supabase SQL Editor에 붙여넣고 실행

**2단계: 상황에 따른 실행**
- **테이블 없음**: `scripts/create-device-models-table.sql` 파일 내용을 복사하여 실행
- **기존 스키마**: `scripts/migrate-device-models-table.sql` 파일 내용을 복사하여 실행
- **새 스키마**: 완료

**3단계: 애플리케이션 테스트**
- 관리자 대시보드에서 단말기 등록/조회 테스트
- 에러가 발생하면 브라우저 콘솔 확인

### 4.2 필드명 변경 사항
- `manufacturer_code` → `manufacturer`
- `supported_carrier_codes` → `supported_carriers`
- `supported_storage_codes` → `supported_storage`
