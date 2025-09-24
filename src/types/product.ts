// 기본 상품 인터페이스
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  storage: string;
  imageUrl: string;
  specifications: Record<string, any>;
  officialPrice: number;
  isActive: boolean;
  isDeleted: boolean; // Soft Delete
  isFavorite: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
}

// 상품 스냅샷 (예약/즐겨찾기 시 저장되는 정보)
export interface ProductSnapshot {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  storage: string;
  imageUrl: string;
  officialPrice: number;
  isDeleted: boolean;
  deletedAt?: string;
  deletionReason?: string;
  snapshotCreatedAt: string; // 스냅샷 생성 시간
}

// 매장별 상품 정보
export interface StoreProduct {
  id: string;
  storeId: string;
  productId: string;
  price: number;
  discountPrice: number;
  stock: number;
  conditions: string;
  promotionOptions: Record<string, any>;
  isAvailable: boolean;
  isDeleted: boolean; // Soft Delete
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;
  productCarrier: "kt" | "skt" | "lgu";
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

// UI용 상품 표시 유틸리티 타입
export interface ProductDisplayInfo {
  name: string;
  model: string;
  storage: string;
  carrier: string;
  price: number;
  isDeleted: boolean;
  deletedAt?: string;
  deletionStatus?: 'deleted_product' | 'deleted_store_product' | 'unavailable';
  deletionMessage?: string;
}