import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/public/products/[id] - 일반 사용자용 특정 상품 조회 (인증 불필요)
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
        ),
        product_tables!inner(
          id,
          exposure_start_date,
          exposure_end_date,
          is_active
        ),
        stores!inner(
          id,
          business_name,
          address,
          phone_number
        )
      `)
      .eq('id', params.id)
      .eq('is_active', true)
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

    // 노출기간 확인
    const today = new Date().toISOString().split('T')[0];
    const exposureStartDate = data.product_tables?.exposure_start_date;
    const exposureEndDate = data.product_tables?.exposure_end_date;
    
    if (exposureStartDate && exposureEndDate) {
      if (today < exposureStartDate || today > exposureEndDate) {
        return NextResponse.json(
          { error: '현재 노출되지 않는 상품입니다.' },
          { status: 404 }
        );
      }
    }

    // 응답 데이터 변환
    const product = {
      id: data.id,
      storeId: data.store_id,
      deviceModelId: data.device_model_id,
      carrier: data.carrier,
      storage: data.storage,
      price: data.price,
      conditions: data.conditions || [],
      isActive: data.is_active,
      exposureStartDate: data.product_tables?.exposure_start_date || '',
      exposureEndDate: data.product_tables?.exposure_end_date || '',
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '',
      updatedAt: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : '',
      deviceModel: {
        id: data.device_models.id,
        manufacturer: data.device_models.manufacturer,
        model: data.device_models.model,
        imageUrl: data.device_models.image_url
      },
      store: {
        id: data.stores.id,
        businessName: data.stores.business_name,
        address: data.stores.address,
        phoneNumber: data.stores.phone_number
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
