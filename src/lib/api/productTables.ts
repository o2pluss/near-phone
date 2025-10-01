// 상품 테이블 API 클라이언트

export interface ProductTable {
  id: string;
  name: string;
  exposureStartDate: string;
  exposureEndDate: string;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  tableData?: any; // 하위 호환성을 위해 유지 (UI에서만 사용)
  products?: any[]; // API 통신용
}

export interface ProductTableListResponse {
  tables: ProductTable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductTableListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'expired';
}

// 상품 테이블 목록 조회
export async function getProductTables(params: ProductTableListParams = {}): Promise<ProductTableListResponse> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const response = await fetch(`/api/product-tables?${searchParams.toString()}`, {
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
    console.error('상품 테이블 목록 조회 실패:', error);
    throw error;
  }
}

// 특정 상품 테이블 조회
export async function getProductTable(id: string): Promise<ProductTable> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/product-tables/${id}`, {
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
    console.error('상품 테이블 조회 실패:', error);
    throw error;
  }
}

// 상품 테이블 생성
export async function createProductTable(data: {
  name: string;
  exposureStartDate: string;
  exposureEndDate: string;
  products: any[];
}): Promise<{ success: boolean; data?: ProductTable; error?: string }> {
  try {
    console.log('=== createProductTable 시작 ===');
    console.log('요청 데이터:', data);
    
    // 기존 auth.ts의 getCurrentSession 사용
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    console.log('세션 정보:', { hasSession: !!session, hasToken: !!session?.access_token });
    
    if (!session?.access_token) {
      console.error('세션이 없습니다.');
      return { success: false, error: '로그인이 필요합니다.' };
    }

    console.log('API 호출 시작...');
    console.log('현재 URL:', window.location.href);
    console.log('요청 URL:', '/api/product-tables');
    console.log('요청 헤더:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token?.substring(0, 20)}...`
    });
    
    const response = await fetch('/api/product-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });
    
    console.log('API 호출 완료, 응답 상태:', response.status);

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
    }

    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error) {
    console.error('상품 테이블 생성 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : '상품 테이블 생성 중 오류가 발생했습니다.' };
  }
}

// 상품 테이블 수정
export async function updateProductTable(id: string, data: {
  name: string;
  exposureStartDate: string;
  exposureEndDate: string;
  products: any[];
}): Promise<ProductTable> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/product-tables/${id}`, {
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
    console.error('상품 테이블 수정 실패:', error);
    throw error;
  }
}

// 상품 테이블 삭제
export async function deleteProductTable(id: string): Promise<void> {
  try {
    // 현재 세션에서 토큰 가져오기
    const { getCurrentSession } = await import('@/lib/auth');
    const session = await getCurrentSession();
    
    if (!session?.access_token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`/api/product-tables/${id}`, {
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
    console.error('상품 테이블 삭제 실패:', error);
    throw error;
  }
}
