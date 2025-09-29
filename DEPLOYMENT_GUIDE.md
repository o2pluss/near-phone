# 프로덕션 배포 가이드

## 1. 환경 변수 설정

### Vercel 배포 시
```bash
# Vercel CLI로 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 다른 플랫폼 배포 시
환경 변수를 다음 값으로 설정:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

## 2. 데이터베이스 설정

### RLS 정책 적용 (프로덕션 안전)
```sql
-- Supabase SQL Editor에서 실행
\i database/setup_production_safe_rls.sql
```

### RLS 정책 수동 설정 (권장)
Supabase 대시보드의 SQL Editor에서 다음 쿼리를 실행:

```sql
-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can manage product_tables" ON product_tables;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- 2. RLS 활성화
ALTER TABLE product_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. 안전한 정책 생성
CREATE POLICY "Authenticated users can manage product_tables" ON product_tables
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');
```

### 테이블 생성
```sql
-- Supabase SQL Editor에서 실행
\i database/create_product_tables.sql
\i database/update_products_table.sql
```

## 3. 보안 체크리스트

- [ ] 서비스 키가 클라이언트 코드에 노출되지 않음
- [ ] RLS 정책이 올바르게 설정됨
- [ ] 이메일 인증이 활성화됨
- [ ] HTTPS가 활성화됨
- [ ] CORS 설정이 적절함

## 4. 모니터링

### 로그 확인
- Supabase Dashboard > Logs에서 API 호출 모니터링
- Vercel Dashboard > Functions에서 서버 로그 확인

### 에러 알림 설정
- Supabase에서 에러 알림 설정
- Vercel에서 함수 에러 알림 설정

## 5. 성능 최적화

### 데이터베이스 인덱스
```sql
-- 자주 사용되는 쿼리에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_table_id ON products(table_id);
CREATE INDEX IF NOT EXISTS idx_products_carrier ON products(carrier);
CREATE INDEX IF NOT EXISTS idx_product_tables_active ON product_tables(is_active);
```

### 캐싱 전략
- API 응답 캐싱 (Next.js ISR 활용)
- 정적 데이터 캐싱 (Redis 또는 Vercel Edge Config)

## 6. 백업 및 복구

### 데이터베이스 백업
```bash
# Supabase CLI로 백업
supabase db dump --file backup.sql
```

### 자동 백업 설정
- Supabase Dashboard > Settings > Database에서 자동 백업 활성화
