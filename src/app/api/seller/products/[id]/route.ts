import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductUpdateRequest, ProductWithDetails } from '@/types/product';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/seller/products/[id] - 판매자용 특정 상품 조회 (인증 필요)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '유효한 인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '토큰 검증에 실패했습니다.' },
        { status: 401 }
      );
    }

    // 현재 사용자의 스토어 ID 조회
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('seller_id', user.id)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: '스토어 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

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
      .eq('store_id', storeData.id) // 스토어 소유권 검증
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

// PUT /api/seller/products/[id] - 판매자용 상품 수정 (인증 필요)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '유효한 인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '토큰 검증에 실패했습니다.' },
        { status: 401 }
      );
    }

    // 현재 사용자의 스토어 ID 조회
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('seller_id', user.id)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: '스토어 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

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
      .eq('store_id', storeData.id) // 스토어 소유권 검증
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

// DELETE /api/seller/products/[id] - 판매자용 상품 삭제 (인증 필요)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '유효한 인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '토큰 검증에 실패했습니다.' },
        { status: 401 }
      );
    }

    // 현재 사용자의 스토어 ID 조회
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('seller_id', user.id)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: '스토어 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)
      .eq('store_id', storeData.id); // 스토어 소유권 검증

    if (error) {
      console.error('상품 삭제 실패:', error);
      return NextResponse.json(
        { error: '상품 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '상품이 삭제되었습니다.' });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
