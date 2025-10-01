import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// RLS 우회를 위한 서비스 키 클라이언트
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET /api/product-tables/[id] - 특정 상품 테이블 조회
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

    const { id } = params;

    // 상품 테이블 조회 (스토어별 필터링)
    const { data, error } = await supabase
      .from('product_tables')
      .select('*')
      .eq('id', id)
      .eq('store_id', storeData.id)
      .single();

    if (error) {
      console.error('상품 테이블 조회 실패:', error);
      return NextResponse.json(
        { error: '상품 테이블을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 데이터 조회 (스토어별 필터링) - 서비스 키 사용
    const { data: products, count: productCount } = await supabaseService
      .from('products')
      .select('*', { count: 'exact' })
      .eq('table_id', id)
      .eq('store_id', storeData.id);

    return NextResponse.json({
      id: data.id,
      name: data.name,
      exposureStartDate: data.exposure_start_date,
      exposureEndDate: data.exposure_end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      products: products || [],
      productCount: productCount || 0
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/product-tables/[id] - 상품 테이블 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, exposureStartDate, exposureEndDate, products } = body;

    // 필수 필드 검증
    if (!name || !exposureStartDate || !exposureEndDate) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 상품 테이블 업데이트 - 서비스 키 사용
    const { data, error } = await supabaseService
      .from('product_tables')
      .update({
        name,
        exposure_start_date: exposureStartDate,
        exposure_end_date: exposureEndDate,
        table_data: products, // products 배열을 table_data로 저장
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('상품 테이블 수정 실패:', error);
      return NextResponse.json(
        { error: '상품 테이블 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 상품 데이터가 있으면 업데이트
    if (products && Array.isArray(products) && products.length > 0) {
      // 기존 상품들 삭제 - 서비스 키 사용
      const { error: deleteError } = await supabaseService
        .from('products')
        .delete()
        .eq('table_id', id);

      if (deleteError) {
        console.error('기존 상품 삭제 실패:', deleteError);
        return NextResponse.json(
          { error: '기존 상품 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 새 상품들 삽입
      const productsToInsert = products.map((product: any) => ({
        store_id: product.storeId,
        device_model_id: product.deviceModelId,
        carrier: product.carrier,
        storage: product.storage,
        price: product.price,
        conditions: product.conditions || [],
        is_active: product.isActive ?? true,
        table_id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabaseService
        .from('products')
        .insert(productsToInsert);

      if (insertError) {
        console.error('상품 업데이트 실패:', insertError);
        return NextResponse.json(
          { error: '상품 업데이트에 실패했습니다.', details: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/product-tables/[id] - 상품 테이블 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 관련 상품들도 함께 삭제 - 서비스 키 사용
    await supabaseService
      .from('products')
      .delete()
      .eq('table_id', id);

    const { error } = await supabaseService
      .from('product_tables')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('상품 테이블 삭제 실패:', error);
      return NextResponse.json(
        { error: '상품 테이블 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '상품 테이블이 삭제되었습니다.' });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
