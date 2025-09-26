# 데이터베이스 스키마 설계 (V3 - 코드 기반)

## 개요
통신사, 제조사, 용량을 코드로 관리하여 일관성을 보장하는 구조

## 1. 단말기 모델 테이블 (device_models)
관리자가 등록하는 기본 단말기 정보

```sql
CREATE TABLE device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL, -- 'SAMSUNG', 'APPLE'
  model VARCHAR(100) NOT NULL, -- 'iPhone 15 Pro', 'Galaxy S24 Ultra'
  supported_carriers TEXT[] NOT NULL, -- ['KT', 'SKT', 'LG_U_PLUS']
  supported_storage TEXT[] NOT NULL, -- ['128GB', '256GB', '512GB', '2TB']
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제조사 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_manufacturer CHECK (
    manufacturer IN ('SAMSUNG', 'APPLE')
  )
);
```

## 2. 상품 테이블 (products)
판매자가 등록하는 실제 판매 상품 (모델+통신사+용량 조합별로 개별 레코드)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES seller_applications(id),
  device_model_id UUID NOT NULL REFERENCES device_models(id),
  carrier_code VARCHAR(20) NOT NULL, -- 'KT', 'SKT', 'LG_U_PLUS'
  storage_code VARCHAR(10) NOT NULL, -- '128GB', '256GB', '512GB', '2TB'
  price INTEGER NOT NULL, -- 이 조합의 가격
  conditions TEXT[] DEFAULT '{}', -- ['번호이동', '신규가입', '기기변경']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  UNIQUE(store_id, device_model_id, carrier_code, storage_code, conditions),
  
  -- 코드 검증을 위한 체크 제약조건
  CONSTRAINT valid_carrier_code CHECK (
    carrier_code IN ('KT', 'SKT', 'LG_U_PLUS')
  ),
  CONSTRAINT valid_storage_code CHECK (
    storage_code IN ('128GB', '256GB', '512GB', '2TB')
  )
);
```

## 3. 코드 관리 테이블 (선택사항)
코드와 라벨을 데이터베이스에서 관리하고 싶은 경우

```sql
-- 통신사 코드 테이블
CREATE TABLE carrier_codes (
  code VARCHAR(20) PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO carrier_codes (code, label, display_order) VALUES
('KT', 'KT', 1),
('SKT', 'SKT', 2),
('LG_U_PLUS', 'LG U+', 3);

-- 제조사 코드 테이블
CREATE TABLE manufacturer_codes (
  code VARCHAR(20) PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO manufacturer_codes (code, label, display_order) VALUES
('SAMSUNG', '삼성', 1),
('APPLE', '애플', 2);

-- 용량 코드 테이블
CREATE TABLE storage_codes (
  code VARCHAR(10) PRIMARY KEY,
  label VARCHAR(20) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO storage_codes (code, label, display_order) VALUES
('128GB', '128GB', 1),
('256GB', '256GB', 2),
('512GB', '512GB', 3),
('2TB', '2TB', 4);
```

## 4. 상품 가격 이력 테이블 (product_price_history)
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

## 5. 상품 상태 변경 이력 테이블 (product_status_history)
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

### 1. **코드 기반 관리**
- `carrier` → `carrier_code` (KT, SKT, LG_U_PLUS)
- `manufacturer` → `manufacturer_code` (SAMSUNG, APPLE, LG 등)
- `storage` → `storage_code` (128GB, 256GB, 512GB, 1TB)

### 2. **데이터 일관성 보장**
- 체크 제약조건으로 유효한 코드만 입력 가능
- 코드 변경 시 한 곳에서만 수정하면 전체 시스템에 반영

### 3. **다국어 지원 준비**
- 코드는 고정, 라벨은 언어별로 다르게 표시 가능
- 코드 관리 테이블을 사용하면 런타임에 라벨 변경 가능

### 4. **확장성**
- 새로운 통신사나 제조사 추가 시 코드만 추가
- 기존 데이터에 영향 없음

## API 엔드포인트

### 코드 목록 조회
```typescript
GET /api/codes/carriers
GET /api/codes/manufacturers  
GET /api/codes/storages
// 응답: { code: string, label: string, isActive: boolean }[]
```

### 단말기 모델 조회
```typescript
GET /api/device-models
// 응답: 관리자가 등록한 모든 단말기 모델과 지원 코드 목록
```

### 상품 등록
```typescript
POST /api/products
// 요청: { 
//   deviceModelId, 
//   combinations: [
//     { carrierCode: 'KT', storageCode: '128GB', price: 1200000, conditions: ['번호이동'] },
//     { carrierCode: 'KT', storageCode: '256GB', price: 1400000, conditions: ['번호이동'] },
//     { carrierCode: 'SKT', storageCode: '128GB', price: 1300000, conditions: ['신규가입'] },
//     { carrierCode: 'SKT', storageCode: '256GB', price: 1500000, conditions: ['신규가입'] }
//   ]
// }
```

### 상품 검색 (매장 찾기용)
```typescript
GET /api/products/search?model=iPhone&carrierCodes=KT,SKT&storageCodes=128GB,256GB
// 응답: 검색 조건에 맞는 상품 목록 (각각의 Product 레코드)
```

## 장점

1. **일관성**: 코드로 관리하여 데이터 일관성 보장
2. **확장성**: 새로운 코드 추가 시 기존 코드 수정 불필요
3. **다국어 지원**: 코드는 고정, 라벨은 언어별로 다르게 표시
4. **유지보수성**: 코드 변경 시 한 곳에서만 수정
5. **데이터 무결성**: 체크 제약조건으로 유효한 코드만 입력 가능
6. **검색 효율성**: 코드 기반으로 빠른 검색 가능
