// 기존 DeviceModel과 Product 인터페이스는 유지하고 추가 타입 정의

// 상품 생성/수정 요청 타입
export interface ProductCreateRequest {
  storeId: string;
  deviceModelId: string;
  carrier: CarrierCode;
  storage: StorageCode;
  price: number;
  conditions: string[];
  isActive?: boolean;
}

export interface ProductUpdateRequest {
  carrier?: CarrierCode;
  storage?: StorageCode;
  price?: number;
  conditions?: string[];
  isActive?: boolean;
}

// 상품 검색 요청 타입
export interface ProductSearchRequest {
  storeId?: string;
  deviceModelId?: string;
  carrier?: CarrierCode;
  storage?: StorageCode;
  manufacturer?: ManufacturerCode;
  model?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// 상품 검색 결과 타입
export interface ProductSearchResult {
  products: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
}

// 상품 상세 정보 (DeviceModel 정보 포함)
export interface ProductWithDetails extends Product {
  deviceModel: {
    id: string;
    manufacturer: ManufacturerCode;
    model: string;
    imageUrl?: string;
  };
}

// 상품 통계 타입
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  byManufacturer: Record<ManufacturerCode, number>;
  byCarrier: Record<CarrierCode, number>;
  byStorage: Record<StorageCode, number>;
}

// 상품 일괄 작업 타입
export interface ProductBulkOperation {
  type: 'create' | 'update' | 'delete';
  productIds?: string[];
  products?: ProductCreateRequest[];
  updates?: Record<string, ProductUpdateRequest>;
}

// 상품 일괄 작업 결과 타입
export interface ProductBulkResult {
  success: boolean;
  created?: number;
  updated?: number;
  deleted?: number;
  errors?: Array<{
    productId?: string;
    error: string;
  }>;
}