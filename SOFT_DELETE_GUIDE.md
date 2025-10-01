# 소프트 삭제 시스템 가이드

## 개요
시스템이 하드 삭제에서 소프트 삭제로 전환되었습니다. 이제 상품과 상품 테이블을 삭제해도 데이터가 완전히 사라지지 않고, 복구가 가능합니다.

## 주요 변경사항

### 1. 데이터베이스 스키마 변경
- `products` 테이블에 `deleted_at`, `deletion_reason` 필드 추가
- `product_tables` 테이블에 `deleted_at`, `deletion_reason` 필드 추가
- 삭제 관련 인덱스 및 뷰 생성

### 2. API 변경사항

#### 삭제 API
- **기존**: 완전 삭제 (DELETE)
- **변경**: 소프트 삭제 (UPDATE is_active = false)

#### 새로운 API 엔드포인트
- `GET /api/admin/deleted-products` - 삭제된 상품/테이블 조회
- `POST /api/admin/restore` - 삭제된 항목 복구

## 사용법

### 1. 데이터베이스 마이그레이션 실행
```sql
-- Supabase SQL Editor에서 실행
\i soft-delete-migration.sql
```

### 2. 상품 삭제 (소프트 삭제)
```javascript
// 상품 삭제
const response = await fetch('/api/products/product-id', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    deletionReason: 'out_of_stock' // 선택사항
  })
});

// 응답
{
  "success": true,
  "message": "상품이 삭제되었습니다.",
  "deletedAt": "2024-01-15T10:30:00.000Z",
  "canRestore": true
}
```

### 3. 상품 테이블 삭제 (소프트 삭제)
```javascript
// 상품 테이블 삭제
const response = await fetch('/api/product-tables/table-id', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    deletionReason: 'seasonal_removal' // 선택사항
  })
});
```

### 4. 삭제된 항목 조회 (관리자용)
```javascript
// 삭제된 상품 조회
const response = await fetch('/api/admin/deleted-products?type=products&page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer admin-token'
  }
});

// 삭제된 상품 테이블 조회
const response = await fetch('/api/admin/deleted-products?type=tables&page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer admin-token'
  }
});
```

### 5. 삭제된 항목 복구 (관리자용)
```javascript
// 상품 복구
const response = await fetch('/api/admin/restore', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token'
  },
  body: JSON.stringify({
    type: 'product',
    id: 'product-id'
  })
});

// 상품 테이블 복구 (관련 상품도 함께 복구)
const response = await fetch('/api/admin/restore', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token'
  },
  body: JSON.stringify({
    type: 'product_table',
    id: 'table-id',
    restoreChildren: true
  })
});
```

## 정기적 정리 작업

### 1. 수동 실행
```bash
# 1년 이상 된 삭제된 데이터 정리 (실제 삭제)
npm run cleanup:deleted

# 6개월 이상 된 삭제된 데이터 정리
npm run cleanup:deleted:custom

# 실제 삭제하지 않고 로그만 출력 (테스트용)
npm run cleanup:deleted:dry-run
```

### 2. 자동 실행 설정
PostgreSQL의 pg_cron 확장을 사용하여 주기적으로 실행할 수 있습니다:

```sql
-- 매주 일요일 새벽 2시에 실행
SELECT cron.schedule('cleanup-deleted-data', '0 2 * * 0', 'SELECT cleanup_old_deleted_data();');
```

## 삭제 사유 코드

| 코드 | 설명 |
|------|------|
| `product_deleted` | 일반적인 상품 삭제 |
| `product_table_deleted` | 상품 테이블 삭제로 인한 상품 삭제 |
| `parent_table_deleted` | 부모 테이블 삭제로 인한 자동 삭제 |
| `out_of_stock` | 재고 부족 |
| `seasonal_removal` | 시즌 상품 제거 |
| `discontinued` | 단종 |
| `admin_cleanup` | 관리자 정리 작업 |

## 주의사항

### 1. 검색 성능
- 삭제된 상품은 자동으로 검색 결과에서 제외됩니다
- `is_active = true AND deleted_at IS NULL` 조건이 자동 적용됩니다

### 2. 예약 시스템 연관성
- 삭제된 상품도 예약 이력에서 참조 가능합니다
- 예약 시점의 상품 정보는 스냅샷으로 보존됩니다

### 3. 저장 공간 관리
- 삭제된 데이터도 저장 공간을 차지합니다
- 정기적 정리 작업을 통해 오래된 데이터를 완전 삭제하세요

### 4. 복구 시 주의사항
- 복구된 상품은 다시 활성 상태가 됩니다
- 관련 상품 테이블이 삭제된 상태라면 상품만 복구할 수 있습니다

## 모니터링

### 1. 삭제된 데이터 현황 확인
```sql
-- 삭제된 상품 수
SELECT COUNT(*) FROM products WHERE is_active = false OR deleted_at IS NOT NULL;

-- 삭제된 상품 테이블 수
SELECT COUNT(*) FROM product_tables WHERE is_active = false OR deleted_at IS NOT NULL;

-- 삭제 사유별 통계
SELECT deletion_reason, COUNT(*) FROM products 
WHERE is_active = false OR deleted_at IS NOT NULL 
GROUP BY deletion_reason;
```

### 2. 시스템 로그 확인
```sql
-- 정리 작업 로그
SELECT * FROM system_logs 
WHERE action = 'cleanup_old_deleted_data' 
ORDER BY created_at DESC;
```

## 문제 해결

### 1. 복구 실패
- 관리자 권한이 있는지 확인
- 삭제된 항목이 존재하는지 확인
- 관련 테이블의 상태 확인

### 2. 검색 결과에 삭제된 상품이 나타나는 경우
- API에서 `is_active = true AND deleted_at IS NULL` 조건 확인
- 캐시 문제일 수 있으니 브라우저 새로고침

### 3. 정리 작업 실패
- 데이터베이스 연결 확인
- 서비스 키 권한 확인
- 로그에서 구체적인 오류 메시지 확인
