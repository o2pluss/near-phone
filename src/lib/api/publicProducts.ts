// 일반 사용자용 공개 상품 API 클라이언트

export interface PublicProduct {
  id: string;
  storeId: string;
  deviceModelId: string;
  carrier: string;
  storage: string;
  price: number;
  conditions: string[];
  isActive: boolean;
  exposureStartDate: string;
  exposureEndDate: string;
  createdAt: string;
  updatedAt: string;
  deviceModel: {
    id: string;
    manufacturer: string;
    model: string;
    imageUrl: string;
  };
  store: {
    id: string;
    businessName: string;
    address: string;
    phoneNumber: string;
  };
}

export interface PublicProductSearchParams {
  deviceModelId?: string;
  carrier?: string;
  storage?: string;
  manufacturer?: string;
  model?: string;
  page?: number;
  limit?: number;
}

export interface PublicProductSearchResult {
  products: PublicProduct[];
  total: number;
  page: number;
  limit: number;
}

// 공개 상품 목록 조회 (인증 불필요)
export async function getPublicProducts(params: PublicProductSearchParams = {}): Promise<PublicProductSearchResult> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.deviceModelId) searchParams.append('deviceModelId', params.deviceModelId);
    if (params.carrier) searchParams.append('carrier', params.carrier);
    if (params.storage) searchParams.append('storage', params.storage);
    if (params.manufacturer) searchParams.append('manufacturer', params.manufacturer);
    if (params.model) searchParams.append('model', params.model);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/public/products?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('공개 상품 목록 조회 실패:', error);
    throw error;
  }
}

// 공개 특정 상품 조회 (인증 불필요)
export async function getPublicProduct(id: string): Promise<PublicProduct> {
  try {
    const response = await fetch(`/api/public/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('공개 상품 조회 실패:', error);
    throw error;
  }
}
