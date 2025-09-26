import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductBulkOperation, ProductBulkResult, ProductCreateRequest, ProductUpdateRequest } from '@/types/product';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/products/bulk - 상품 일괄 작업
export async function POST(request: NextRequest) {
  try {
    const body: ProductBulkOperation = await request.json();
    const { type, productIds, products, updates } = body;

    const result: ProductBulkResult = {
      success: true,
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };

    if (type === 'create' && products) {
      // 상품 일괄 생성
      const { data, error } = await supabase
        .from('products')
        .insert(products.map(product => ({
          store_id: product.storeId,
          device_model_id: product.deviceModelId,
          carrier: product.carrier,
          storage: product.storage,
          price: product.price,
          conditions: product.conditions || [],
          is_active: product.isActive ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) {
        result.success = false;
        result.errors?.push({
          error: `상품 생성 실패: ${error.message}`
        });
      } else {
        result.created = data?.length || 0;
      }
    } else if (type === 'update' && updates) {
      // 상품 일괄 수정
      const updatePromises = Object.entries(updates).map(async ([productId, updateData]) => {
        const { error } = await supabase
          .from('products')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);

        if (error) {
          result.errors?.push({
            productId,
            error: `상품 수정 실패: ${error.message}`
          });
          return false;
        }
        return true;
      });

      const results = await Promise.all(updatePromises);
      result.updated = results.filter(Boolean).length;
      result.success = result.errors?.length === 0;
    } else if (type === 'delete' && productIds) {
      // 상품 일괄 삭제
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (error) {
        result.success = false;
        result.errors?.push({
          error: `상품 삭제 실패: ${error.message}`
        });
      } else {
        result.deleted = productIds.length;
      }
    } else {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
