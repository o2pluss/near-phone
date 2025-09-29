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
      // 먼저 모든 device_model_id가 존재하는지 검증
      const deviceModelIds = [...new Set(products.map(p => p.deviceModelId))];
      console.log('Requested deviceModelIds:', deviceModelIds);
      
      const { data: existingModels, error: modelCheckError } = await supabase
        .from('device_models')
        .select('id')
        .in('id', deviceModelIds);

      if (modelCheckError) {
        console.error('Model check error:', modelCheckError);
        result.success = false;
        result.errors?.push({
          error: `모델 정보 확인 실패: ${modelCheckError.message}`
        });
        return NextResponse.json(result, { status: 400 });
      }

      console.log('Existing models from DB:', existingModels?.map(m => m.id) || []);
      const existingModelIds = new Set(existingModels?.map(m => m.id) || []);
      const invalidModelIds = deviceModelIds.filter(id => !existingModelIds.has(id));
      
      if (invalidModelIds.length > 0) {
        console.error('Invalid model IDs:', invalidModelIds);
        result.success = false;
        result.errors?.push({
          error: `존재하지 않는 모델 ID가 포함되어 있습니다: ${invalidModelIds.join(', ')}`
        });
        return NextResponse.json(result, { status: 400 });
      }

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
            table_id: product.tableId || null,
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

    // 성공 여부에 따라 적절한 상태 코드 반환
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
