import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductUpdateRequest, ProductWithDetails } from '@/types/product';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/products/[id] - 특정 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        device_models!inner(
          id,
          manufacturer,
          model,
          image_url
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '상품을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('상품 조회 실패:', error);
      return NextResponse.json(
        { error: '상품 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 응답 데이터 변환
    const product: ProductWithDetails = {
      id: data.id,
      storeId: data.store_id,
      deviceModelId: data.device_model_id,
      carrier: data.carrier,
      storage: data.storage,
      price: data.price,
      conditions: data.conditions || [],
      isActive: data.is_active,
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
      updatedAt: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : '',
      deviceModel: {
        id: data.device_models.id,
        manufacturer: data.device_models.manufacturer,
        model: data.device_models.model,
        imageUrl: data.device_models.image_url
      }
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ProductUpdateRequest = await request.json();
    const {
      carrier,
      storage,
      price,
      conditions,
      isActive
    } = body;

    // 가격 검증
    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: '가격은 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (carrier !== undefined) updateData.carrier = carrier;
    if (storage !== undefined) updateData.storage = storage;
    if (price !== undefined) updateData.price = price;
    if (conditions !== undefined) updateData.conditions = conditions;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        device_models!inner(
          id,
          manufacturer,
          model,
          image_url
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '상품을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('상품 수정 실패:', error);
      return NextResponse.json(
        { error: '상품 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 응답 데이터 변환
    const product: ProductWithDetails = {
      id: data.id,
      storeId: data.store_id,
      deviceModelId: data.device_model_id,
      carrier: data.carrier,
      storage: data.storage,
      price: data.price,
      conditions: data.conditions || [],
      isActive: data.is_active,
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
      updatedAt: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : '',
      deviceModel: {
        id: data.device_models.id,
        manufacturer: data.device_models.manufacturer,
        model: data.device_models.model,
        imageUrl: data.device_models.image_url
      }
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('상품 삭제 실패:', error);
      return NextResponse.json(
        { error: '상품 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
