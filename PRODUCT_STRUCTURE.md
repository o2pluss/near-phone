# 상품 관리 시스템 구조 개선

## 개요
판매자가 단말기를 선택하고 용량별로 다른 가격을 설정할 수 있도록 시스템을 개선했습니다.

## 주요 변경사항

### 1. 데이터 구조 개선

#### 기존 구조 (문제점)
```typescript
interface Product {
  id: string;
  model: string;
  carrier: string;
  storage: string;  // 단일 용량만 저장
  price: number;    // 단일 가격만 저장
  conditions: string[];
  isActive: boolean;
}
```

#### 개선된 구조
```typescript
// 단말기 모델 (관리자가 등록)
interface DeviceModel {
  id: string;
  carrier: string;
  manufacturer: string;
  model: string;
  supportedStorage: string[]; // 지원하는 용량 목록
  imageUrl?: string;
}

// 상품 (판매자가 등록, 용량별 가격)
interface Product {
  id: string;
  storeId: string;
  deviceModelId: string;
  deviceModel: DeviceModel;
  carrier: string;
  variants: ProductVariant[]; // 용량별 상품 정보
}

interface ProductVariant {
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
}
```

### 2. 데이터베이스 스키마

#### device_models 테이블
- 관리자가 등록하는 기본 단말기 정보
- 지원하는 용량 목록을 배열로 저장

#### products 테이블
- 판매자가 등록하는 실제 판매 상품
- 각 용량별로 별도 레코드 생성
- 용량별로 다른 가격과 조건 설정 가능

### 3. 사용자 경험 개선

#### 관리자 (단말기 등록)
- 단말기 모델 등록 시 지원 용량을 체크박스로 선택
- 128GB, 256GB, 512GB, 1TB 중 선택 가능

#### 판매자 (상품 등록)
- 단말기 모델 선택 후 용량별 가격 설정
- 각 용량마다 다른 가격과 조건 설정 가능
- 용량별로 활성화/비활성화 설정 가능

#### 고객 (상품 검색)
- 모델, 통신사, 용량별로 상품 검색
- 가격순 정렬로 최적의 상품 찾기
- 조건별 필터링 지원

### 4. API 엔드포인트

```typescript
// 단말기 모델 조회
GET /api/device-models
// 응답: 관리자가 등록한 모든 단말기 모델과 지원 용량

// 상품 등록
POST /api/products
// 요청: { deviceModelId, variants: [{ storage, price, conditions }] }

// 상품 검색
GET /api/products/search?model=iPhone&storage=256GB&minPrice=1000000
// 응답: 검색 조건에 맞는 상품 목록
```

### 5. 컴포넌트 구조

#### ProductVariantEditor
- 용량별 가격을 입력할 수 있는 전용 컴포넌트
- 각 용량마다 가격, 조건, 활성화 상태 설정
- 실시간 유효성 검사

#### 기존 컴포넌트 개선
- ProductBulkEditor: 용량별 가격 지원
- ProductManagement: 새로운 데이터 구조 반영

## 구현 예시

### 판매자가 상품 등록하는 과정

1. **단말기 모델 선택**
   ```typescript
   const deviceModel = {
     id: "1",
     model: "iPhone 15 Pro",
     carrier: "KT",
     supportedStorage: ["128GB", "256GB", "512GB", "1TB"]
   };
   ```

2. **용량별 가격 설정**
   ```typescript
   const variants = [
     { storage: "128GB", price: 1200000, conditions: ["번호이동"], isActive: true },
     { storage: "256GB", price: 1400000, conditions: ["번호이동", "신규가입"], isActive: true },
     { storage: "512GB", price: 1600000, conditions: ["번호이동"], isActive: false },
     { storage: "1TB", price: 1800000, conditions: ["번호이동"], isActive: true }
   ];
   ```

3. **API 호출**
   ```typescript
   await createProduct(storeId, {
     deviceModelId: "1",
     variants: variants
   });
   ```

## 장점

1. **유연성**: 용량별로 다른 가격과 조건 설정 가능
2. **확장성**: 새로운 용량 추가 시 기존 코드 수정 불필요
3. **일관성**: 단말기 모델 정보와 상품 정보 분리로 데이터 중복 방지
4. **사용성**: 직관적인 UI로 용량별 가격 설정 가능

## 마이그레이션 계획

1. **1단계**: 데이터베이스 스키마 생성
2. **2단계**: 기존 데이터 마이그레이션
3. **3단계**: 새로운 컴포넌트 배포
4. **4단계**: 기존 컴포넌트 업데이트
5. **5단계**: 테스트 및 검증
