# 데이터베이스 스키마 설계 (V2)

## 개요
통신사와 용량을 조합하여 각각을 별도 상품으로 생성하는 구조로 개선

## 1. 단말기 모델 테이블 (device_models)
관리자가 등록하는 기본 단말기 정보

```sql
CREATE TABLE device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(50) NOT NULL, -- '삼성', '애플', 'LG'
  model VARCHAR(100) NOT NULL, -- 'iPhone 15 Pro', 'Galaxy S24 Ultra'
  supported_carriers TEXT[] NOT NULL, -- ['KT', 'SKT', 'LG U+']
  supported_storage TEXT[] NOT NULL, -- ['128GB', '256GB', '512GB', '1TB']
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. 상품 테이블 (products)
판매자가 등록하는 실제 판매 상품 (모델+통신사+용량 조합별로 개별 레코드)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES seller_applications(id),
  device_model_id UUID NOT NULL REFERENCES device_models(id),
  carrier VARCHAR(20) NOT NULL, -- 'KT', 'SKT', 'LG U+'
  storage VARCHAR(10) NOT NULL, -- '128GB', '256GB', '512GB', '1TB'
  price INTEGER NOT NULL, -- 이 조합의 가격
  conditions TEXT[] DEFAULT '{}', -- ['번호이동', '신규가입', '기기변경']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  UNIQUE(store_id, device_model_id, carrier, storage, conditions)
);
```

## 3. 상품 가격 이력 테이블 (product_price_history)
가격 변경 이력을 추적

```sql
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  old_price INTEGER,
  new_price INTEGER NOT NULL,
  changed_by UUID NOT NULL, -- 사용자 ID
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. 상품 상태 변경 이력 테이블 (product_status_history)
상품 활성화/비활성화 이력을 추적

```sql
CREATE TABLE product_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  old_status BOOLEAN,
  new_status BOOLEAN NOT NULL,
  changed_by UUID NOT NULL, -- 사용자 ID
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 주요 변경사항

### 1. **DeviceModel 구조 변경**
- `carrier` 필드 제거 (단일 통신사 → 다중 통신사 지원)
- `supported_carriers` 배열로 변경
- `storage` → `supported_storage`로 명명 변경

### 2. **Product 구조 변경**
- `variants` 제거 (용량별 가격을 별도 레코드로 관리)
- `carrier`, `storage` 필드 추가 (조합별 개별 레코드)
- `price` 단일 가격 (이 조합의 가격)

### 3. **상품 생성 예시**
```
사용자 선택:
- 모델: iPhone 15 Pro
- 통신사: KT, SKT
- 용량: 128GB, 256GB

생성되는 Product 레코드:
1. iPhone 15 Pro + KT + 128GB + 가격1
2. iPhone 15 Pro + KT + 256GB + 가격2
3. iPhone 15 Pro + SKT + 128GB + 가격3
4. iPhone 15 Pro + SKT + 256GB + 가격4
```

## API 엔드포인트

### 단말기 모델 조회
```typescript
GET /api/device-models
// 응답: 관리자가 등록한 모든 단말기 모델과 지원 통신사/용량 목록
```

### 상품 등록
```typescript
POST /api/products
// 요청: { 
//   deviceModelId, 
//   combinations: [
//     { carrier: 'KT', storage: '128GB', price: 1200000, conditions: ['번호이동'] },
//     { carrier: 'KT', storage: '256GB', price: 1400000, conditions: ['번호이동'] },
//     { carrier: 'SKT', storage: '128GB', price: 1300000, conditions: ['신규가입'] },
//     { carrier: 'SKT', storage: '256GB', price: 1500000, conditions: ['신규가입'] }
//   ]
// }
```

### 상품 검색 (매장 찾기용)
```typescript
GET /api/products/search?model=iPhone&carriers=KT,SKT&storages=128GB,256GB
// 응답: 검색 조건에 맞는 상품 목록 (각각의 Product 레코드)
```

### 모델 목록 조회 (매장 찾기용)
```typescript
GET /api/models
// 응답: 모델명 목록 (통신사/용량 정보 없이)
```

## 장점

1. **유연성**: 통신사와 용량의 모든 조합에 대해 다른 가격 설정 가능
2. **확장성**: 새로운 통신사나 용량 추가 시 기존 코드 수정 불필요
3. **일관성**: 각 조합별로 명확한 데이터 구조
4. **검색 효율성**: 통신사+용량 조합으로 빠른 검색 가능
5. **UI 호환성**: 기존 매장 찾기 페이지 UI 변경 없이 사용 가능
