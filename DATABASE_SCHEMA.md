# 데이터베이스 스키마 설계

## 1. 단말기 모델 테이블 (device_models)
관리자가 등록하는 기본 단말기 정보

```sql
CREATE TABLE device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier VARCHAR(20) NOT NULL, -- 'KT', 'SKT', 'LG U+'
  manufacturer VARCHAR(50) NOT NULL, -- '삼성', '애플', 'LG'
  model VARCHAR(100) NOT NULL, -- 'iPhone 15 Pro', 'Galaxy S24 Ultra'
  supported_storage TEXT[] NOT NULL, -- ['128GB', '256GB', '512GB', '1TB']
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. 상품 테이블 (products)
판매자가 등록하는 실제 판매 상품 (용량별 가격 포함)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES seller_applications(id),
  device_model_id UUID NOT NULL REFERENCES device_models(id),
  carrier VARCHAR(20) NOT NULL, -- 단말기 모델의 통신사와 동일
  storage VARCHAR(10) NOT NULL, -- '128GB', '256GB', '512GB', '1TB'
  price INTEGER NOT NULL, -- 용량별 가격
  conditions TEXT[] DEFAULT '{}', -- ['번호이동', '신규가입', '기기변경']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  UNIQUE(store_id, device_model_id, storage, conditions)
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

## 주요 개선사항

### 1. **용량별 가격 지원**
- 각 상품은 특정 용량에 대한 가격을 가짐
- 같은 단말기 모델이라도 용량별로 다른 가격 설정 가능

### 2. **데이터 정규화**
- 단말기 모델 정보와 상품 정보를 분리
- 중복 데이터 최소화

### 3. **이력 관리**
- 가격 변경 이력 추적
- 상품 상태 변경 이력 추적

### 4. **유연한 조건 관리**
- 상품별로 다양한 조건 조합 가능
- 조건별로 다른 가격 설정 가능

## API 엔드포인트 예시

### 단말기 모델 조회
```typescript
GET /api/device-models
// 응답: 관리자가 등록한 모든 단말기 모델과 지원 용량 목록
```

### 상품 등록
```typescript
POST /api/products
// 요청: { deviceModelId, storage, price, conditions }
// 응답: 생성된 상품 정보
```

### 상품 조회 (판매자별)
```typescript
GET /api/products?storeId={storeId}
// 응답: 해당 판매자의 모든 상품 목록
```

### 상품 조회 (고객용)
```typescript
GET /api/products/search?model={model}&carrier={carrier}&storage={storage}
// 응답: 검색 조건에 맞는 상품 목록 (가격순 정렬)
```
