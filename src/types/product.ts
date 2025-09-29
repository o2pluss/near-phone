// 기존 DeviceModel과 Product 인터페이스는 유지하고 추가 타입 정의

import { ManufacturerCode, CarrierCode, StorageCode } from '../lib/constants/codes';

// 공통 DeviceModel 인터페이스
export interface DeviceModel {
  id: string;
  manufacturer: ManufacturerCode;
  deviceName: string; // 갤럭시 S16과 같은 사용자 친화적 이름
  modelName: string; // SAG0-392NG와 같은 코드 형식
  supportedCarriers: CarrierCode[]; // 지원하는 통신사 목록
  supportedStorage: StorageCode[]; // 지원하는 용량 목록
  imageUrl?: string; // 단말기 이미지 URL
  createdAt: string;
}

// 공통 Product 인터페이스
export interface Product {
  id: string;
  deviceName: string;
  carrier: CarrierCode;
  storage: StorageCode;
  price: number;
  conditions: string[];
  isActive: boolean;
  exposureStartDate?: string; // 노출 시작일 (YYYY-MM-DD)
  exposureEndDate?: string;   // 노출 종료일 (YYYY-MM-DD)
  createdAt?: Date;
  updatedAt?: Date;
}

// 상품 생성/수정 요청 타입
export interface ProductCreateRequest {
  storeId: string;
  deviceModelId: string;
  carrier: CarrierCode;
  storage: StorageCode;
  price: number;
  conditions: string[];
  isActive?: boolean;
  exposureStartDate?: string;
  exposureEndDate?: string;
  tableId?: string;
}

export interface ProductUpdateRequest {
  carrier?: CarrierCode;
  storage?: StorageCode;
  price?: number;
  conditions?: string[];
  isActive?: boolean;
  exposureStartDate?: string;
  exposureEndDate?: string;
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
    deviceName: string;
    modelName: string;
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