import { ProductBulkOperation, ProductBulkResult } from '@/types/product';

// 상품 일괄 생성 API 호출
export async function createProductsBulk(products: any[]): Promise<ProductBulkResult> {
  try {
    const response = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'create',
        products: products
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('상품 일괄 생성 실패:', error);
    throw error;
  }
}

// 상품 일괄 수정 API 호출
export async function updateProductsBulk(updates: Record<string, any>): Promise<ProductBulkResult> {
  try {
    const response = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'update',
        updates: updates
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('상품 일괄 수정 실패:', error);
    throw error;
  }
}

// 상품 일괄 삭제 API 호출
export async function deleteProductsBulk(productIds: string[]): Promise<ProductBulkResult> {
  try {
    const response = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'delete',
        productIds: productIds
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('상품 일괄 삭제 실패:', error);
    throw error;
  }
}
