// 판매자용 상품 API 클라이언트 (인증 필요)

import { ProductWithDetails, ProductCreateRequest, ProductUpdateRequest, ProductSearchRequest, ProductSearchResult } from '@/types/product';

// 판매자용 상품 목록 조회 (인증 필요)
export async function getSellerProducts(params: ProductSearchRequest = {}): Promise<ProductSearchResult> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const searchParams = new URLSearchParams();
    
    if (params.deviceModelId) searchParams.append('deviceModelId', params.deviceModelId);
    if (params.carrier) searchParams.append('carrier', params.carrier);
    if (params.storage) searchParams.append('storage', params.storage);
    if (params.manufacturer) searchParams.append('manufacturer', params.manufacturer);
    if (params.model) searchParams.append('model', params.model);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/seller/products?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('판매자 상품 목록 조회 실패:', error);
    throw error;
  }
}

// 판매자용 특정 상품 조회 (인증 필요)
export async function getSellerProduct(id: string): Promise<ProductWithDetails> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/seller/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('판매자 상품 조회 실패:', error);
    throw error;
  }
}

// 판매자용 상품 생성 (인증 필요)
export async function createSellerProduct(data: ProductCreateRequest): Promise<ProductWithDetails> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch('/api/seller/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('판매자 상품 생성 실패:', error);
    throw error;
  }
}

// 판매자용 상품 수정 (인증 필요)
export async function updateSellerProduct(id: string, data: ProductUpdateRequest): Promise<ProductWithDetails> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/seller/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('판매자 상품 수정 실패:', error);
    throw error;
  }
}

// 판매자용 상품 삭제 (인증 필요)
export async function deleteSellerProduct(id: string): Promise<void> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/seller/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('판매자 상품 삭제 실패:', error);
    throw error;
  }
}
