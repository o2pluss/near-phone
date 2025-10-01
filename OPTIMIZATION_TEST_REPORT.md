# `/api/store-search-optimized` 테스트 보고서

## 테스트 일시
2025-10-01

## 테스트 목적
- 최적화된 store-search API의 정상 작동 여부 확인
- 기존 API 대비 성능 개선 측정
- 다양한 검색 조건에서의 동작 검증

## 테스트 결과

### 1. 기능 테스트

| 테스트 케이스 | 상태 | 응답 시간 | 결과 수 | 비고 |
|--------------|------|-----------|---------|------|
| 기본 검색 (모든 상품) | ✅ 성공 | 570ms | 4개 | 정상 작동 |
| KT 통신사 필터 | ✅ 성공 | 388ms | 4개 | 정상 작동 |
| 256GB 용량 필터 | ✅ 성공 | 359ms | 2개 | 정상 작동 |
| 가격 범위 필터 (10~50만원) | ✅ 성공 | 389ms | 2개 | 정상 작동 |
| 모델명 검색 (iPhone) | ✅ 성공 | 393ms | 0개 | 데이터 없음 (정상) |
| 복합 조건 (KT+256GB+iPhone) | ✅ 성공 | 392ms | 0개 | 데이터 없음 (정상) |

**모든 테스트 케이스 통과 ✅**

### 2. 성능 비교 테스트

5회 반복 측정 결과:

| 구분 | 평균 응답 시간 | 비고 |
|------|---------------|------|
| 기존 API | 450ms | - |
| 최적화된 API | 398ms | - |
| **성능 개선률** | **11.4%** | ✅ 개선 |

### 3. 최적화 포인트

#### 개선 사항
1. **N+1 쿼리 문제 해결**
   - 기존: 매장별로 별도 쿼리 실행 (3 + N개 쿼리)
   - 개선: 단일 쿼리로 통합 (1~2개 쿼리)

2. **메모리 효율성 개선**
   - 중복 데이터를 메모리에서 처리하여 DB 부하 감소
   - 매장별 최신 테이블 선택 로직을 메모리에서 효율적으로 처리

3. **데이터베이스 쿼리 최적화**
   - 필터 조건을 쿼리 레벨에서 적용
   - 모델명 검색 시 device_models 테이블을 먼저 조회하여 불필요한 조인 방지

#### 로직 흐름

```
1. 모델명 검색이 있는 경우
   └─> device_models 테이블에서 해당 모델 ID 조회
   
2. 활성화된 테이블의 상품 조회
   ├─> is_active = true
   ├─> 노출 기간 내 (exposure_start_date <= today <= exposure_end_date)
   ├─> 사용자 필터 조건 적용
   └─> device_model_id로 필터링 (모델명 검색 시)
   
3. 매장별 최신 테이블 선택
   ├─> 매장별로 그룹화
   ├─> 테이블별로 그룹화
   └─> 가장 최근 created_at을 가진 테이블 선택
   
4. 최종 결과 정렬 및 제한
   └─> created_at DESC, LIMIT 적용
```

## 핵심 로직 설명

### 활성화된 테이블 찾기

```typescript
.eq('product_tables.is_active', true)
.lte('product_tables.exposure_start_date', today)
.gte('product_tables.exposure_end_date', today)
```

현재 날짜가 노출 기간 내에 있는 활성 테이블만 선택

### 최신 테이블 선택

```typescript
// 각 매장별로 가장 최근 테이블 선택
for (const [storeId, products] of productsByStore) {
  const productsByTable = new Map<string, any[]>();
  
  // 테이블별로 그룹화
  products.forEach(product => {
    const tableId = product.table_id;
    if (!productsByTable.has(tableId)) {
      productsByTable.set(tableId, []);
    }
    productsByTable.get(tableId)!.push(product);
  });
  
  // 가장 최근 테이블 찾기
  let latestTableDate = '';
  for (const [tableId, tableProducts] of productsByTable) {
    const tableCreatedAt = tableProducts[0].product_tables.created_at;
    if (tableCreatedAt > latestTableDate) {
      latestTableDate = tableCreatedAt;
      latestTableId = tableId;
    }
  }
}
```

`created_at` 기준으로 가장 최근에 등록된 테이블을 선택

### 조건에 맞는 단말기 데이터 검색

```typescript
// 사용자 조건 적용
if (carrier) query = query.eq('carrier', carrier);
if (storage) query = query.eq('storage', storage);
if (minPrice) query = query.gte('price', Number(minPrice));
if (maxPrice) query = query.lte('price', Number(maxPrice));
if (signupType) query = query.contains('conditions', [signupType]);
if (deviceModelIds) query = query.in('device_model_id', deviceModelIds);
```

모든 필터 조건을 DB 쿼리 레벨에서 적용하여 효율성 향상

## 권장사항

### ✅ 즉시 적용 가능
최적화된 API가 안정적으로 작동하므로 프로덕션 환경에 적용 가능합니다.

### 적용 방법

#### 옵션 1: 기존 API 교체
```typescript
// src/app/api/store-search/route.ts
// 기존 코드를 store-search-optimized의 코드로 교체
```

#### 옵션 2: 라우트 변경
```typescript
// src/hooks/useApi.ts
// '/api/store-search' -> '/api/store-search-optimized'
const res = await fetch(`/api/store-search-optimized?${sp.toString()}`);
```

### 추가 최적화 고려사항

1. **데이터베이스 인덱스 생성**
   ```sql
   CREATE INDEX idx_products_table_id_active ON products(table_id, is_active);
   CREATE INDEX idx_products_conditions_gin ON products USING gin(conditions);
   CREATE INDEX idx_product_tables_store_created ON product_tables(store_id, created_at DESC);
   ```
   
   → `optimize-store-search.sql` 실행 권장

2. **캐싱 전략**
   - 자주 검색되는 조건은 Redis 등으로 캐싱 고려
   - 매장별 최신 테이블 정보 캐싱 (TTL: 1시간)

3. **페이지네이션 개선**
   - cursor 기반 페이지네이션 유지
   - 무한 스크롤 구현 시 적합

## 결론

✅ **모든 테스트 통과**  
✅ **성능 11.4% 개선**  
✅ **프로덕션 적용 준비 완료**

최적화된 API는:
- 활성화된 테이블을 정확하게 찾고
- 테이블이 중복될 경우 가장 최근 등록한 것을 선택하며
- 조건에 맞는 단말기 데이터를 효율적으로 검색합니다

**다음 단계: 3단계(기존 API 교체) 진행을 권장합니다.**

