import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CarrierCode, StorageCode } from '@/lib/constants/codes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/public/products - 일반 사용자용 상품 목록 조회 (인증 불필요)
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/public/products API 호출됨 (일반 사용자용)');
  try {
    const { searchParams } = new URL(request.url);
    const deviceModelId = searchParams.get('deviceModelId');
    const carrier = searchParams.get('carrier') as CarrierCode;
    const storage = searchParams.get('storage') as StorageCode;
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('요청 파라미터:', { deviceModelId, carrier, storage, manufacturer, model, page, limit });

    let query = supabase
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
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // 필터링 조건 적용
    if (deviceModelId) {
      query = query.eq('device_model_id', deviceModelId);
    }
    if (carrier) {
      query = query.eq('carrier', carrier);
    }
    if (storage) {
      query = query.eq('storage', storage);
    }

    // 노출기간 필터링 (현재 날짜가 노출기간 내에 있는 상품만)
    const today = new Date().toISOString().split('T')[0];
    query = query
      .lte('product_tables.exposure_start_date', today)
      .gte('product_tables.exposure_end_date', today)

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('Supabase 쿼리 실행 중...');
    const { data, error, count } = await query;
    console.log('Supabase 응답:', { data: data?.length || 0, error, count });

    if (error) {
      console.error('❌ 상품 조회 실패:', error);
      return NextResponse.json(
        { error: '상품 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 데이터 변환
    const rawProducts = (data || []).map((item: any) => ({
      id: item.id,
      storeId: item.store_id,
      deviceModelId: item.device_model_id,
      carrier: item.carrier,
      storage: item.storage,
      price: item.price,
      conditions: item.conditions || [],
      isActive: item.is_active,
      exposureStartDate: item.product_tables?.exposure_start_date || '',
      exposureEndDate: item.product_tables?.exposure_end_date || '',
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
      updatedAt: item.updated_at ? new Date(item.updated_at).toISOString().split('T')[0] : '',
      deviceModel: {
        id: item.device_models.id,
        manufacturer: item.device_models.manufacturer,
        model: item.device_models.model,
        imageUrl: item.device_models.image_url
      },
      store: {
        id: item.stores.id,
        businessName: item.stores.business_name,
        address: item.stores.address,
        phoneNumber: item.stores.phone_number
      }
    }));

    // 중복 제거: 같은 모델+통신사+용량+조건 조합 중 최신 데이터만 유지
    const deduplicatedProducts = rawProducts.reduce((acc: any[], product: any) => {
      const key = `${product.deviceModelId}-${product.carrier}-${product.storage}-${product.conditions.sort().join(',')}`;
      
      const existingIndex = acc.findIndex(p => {
        const existingKey = `${p.deviceModelId}-${p.carrier}-${p.storage}-${p.conditions.sort().join(',')}`;
        return existingKey === key;
      });
      
      if (existingIndex === -1) {
        // 새로운 조합이면 추가
        acc.push(product);
      } else {
        // 기존 조합이 있으면 더 최신 데이터로 교체
        const existing = acc[existingIndex];
        if (new Date(product.createdAt) > new Date(existing.createdAt)) {
          acc[existingIndex] = product;
        }
      }
      
      return acc;
    }, []);

    const products = deduplicatedProducts;

    // 제조사/모델 필터링 (PostgreSQL에서 처리)
    let filteredProducts = products;
    if (manufacturer) {
      filteredProducts = filteredProducts.filter(p => p.deviceModel.manufacturer === manufacturer);
    }
    if (model) {
      filteredProducts = filteredProducts.filter(p => 
        p.deviceModel.model.toLowerCase().includes(model.toLowerCase())
      );
    }

    // 중복 제거 후 페이지네이션 적용
    const total = filteredProducts.length;
    const fromFiltered = (page - 1) * limit;
    const toFiltered = fromFiltered + limit;
    const paginatedProducts = filteredProducts.slice(fromFiltered, toFiltered);

    const result = {
      products: paginatedProducts,
      total,
      page,
      limit
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
