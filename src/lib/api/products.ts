import { ProductWithDetails, ProductCreateRequest, ProductUpdateRequest, ProductSearchRequest, ProductSearchResult, ProductBulkOperation, ProductBulkResult } from '@/types/product';

// 상품 목록 조회
export const getProducts = async (params?: ProductSearchRequest): Promise<ProductSearchResult> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.storeId) searchParams.append('storeId', params.storeId);
    if (params?.deviceModelId) searchParams.append('deviceModelId', params.deviceModelId);
    if (params?.carrier) searchParams.append('carrier', params.carrier);
    if (params?.storage) searchParams.append('storage', params.storage);
    if (params?.manufacturer) searchParams.append('manufacturer', params.manufacturer);
    if (params?.model) searchParams.append('model', params.model);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/products?${searchParams.toString()}`);
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { error: `HTTP ${response.status} Error` };
      }
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    return await response.json();
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    throw error;
  }
};

// 특정 상품 조회
export const getProductById = async (id: string): Promise<ProductWithDetails | null> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('상품 조회 실패:', error);
    throw error;
  }
};

// 상품 생성
export const createProduct = async (product: ProductCreateRequest): Promise<ProductWithDetails> => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('상품 생성 실패:', error);
    throw error;
  }
};

// 상품 수정
export const updateProduct = async (id: string, updates: ProductUpdateRequest): Promise<ProductWithDetails> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('상품 수정 실패:', error);
    throw error;
  }
};

// 상품 삭제
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('상품 삭제 실패:', error);
    throw error;
  }
};

// 상품 일괄 작업
export const bulkProductOperation = async (operation: ProductBulkOperation): Promise<ProductBulkResult> => {
  try {
    const response = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operation),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('상품 일괄 작업 실패:', error);
    throw error;
  }
};

// 상품 일괄 생성
export const bulkCreateProducts = async (products: ProductCreateRequest[]): Promise<ProductBulkResult> => {
  return bulkProductOperation({
    type: 'create',
    products
  });
};

// 상품 일괄 수정
export const bulkUpdateProducts = async (updates: Record<string, ProductUpdateRequest>): Promise<ProductBulkResult> => {
  return bulkProductOperation({
    type: 'update',
    updates
  });
};

// 상품 일괄 삭제
export const bulkDeleteProducts = async (productIds: string[]): Promise<ProductBulkResult> => {
  return bulkProductOperation({
    type: 'delete',
    productIds
  });
};