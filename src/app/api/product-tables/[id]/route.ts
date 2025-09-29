import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/product-tables/[id] - 특정 상품 테이블 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('product_tables')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('상품 테이블 조회 실패:', error);
      return NextResponse.json(
        { error: '상품 테이블을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상품 데이터 조회
    const { data: products, count: productCount } = await supabase
      .from('products')
      .select('*')
      .eq('table_id', id);

    return NextResponse.json({
      id: data.id,
      name: data.name,
      exposureStartDate: data.exposure_start_date,
      exposureEndDate: data.exposure_end_date,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tableData: data.table_data,
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
    const { name, exposureStartDate, exposureEndDate, tableData, products } = body;

    // 필수 필드 검증
    if (!name || !exposureStartDate || !exposureEndDate) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 상품 테이블 업데이트
    const { data, error } = await supabase
      .from('product_tables')
      .update({
        name,
        exposure_start_date: exposureStartDate,
        exposure_end_date: exposureEndDate,
        table_data: tableData,
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
      // 기존 상품들 삭제
      const { error: deleteError } = await supabase
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

      const { error: insertError } = await supabase
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

    // 관련 상품들도 함께 삭제
    await supabase
      .from('products')
      .delete()
      .eq('table_id', id);

    const { error } = await supabase
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
