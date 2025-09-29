import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductCreateRequest, ProductSearchRequest, ProductSearchResult, ProductWithDetails } from '@/types/product';
import { CarrierCode, StorageCode } from '@/lib/constants/codes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/products - 상품 목록 조회
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/products API 호출됨');
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const deviceModelId = searchParams.get('deviceModelId');
    const carrier = searchParams.get('carrier') as CarrierCode;
    const storage = searchParams.get('storage') as StorageCode;
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('요청 파라미터:', { storeId, deviceModelId, carrier, storage, manufacturer, model, isActive, page, limit });

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
        )
      `)
      .order('created_at', { ascending: false });

    // 필터링 조건 적용
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    // storeId가 없으면 모든 상품 조회 (개발용)
    if (deviceModelId) {
      query = query.eq('device_model_id', deviceModelId);
    }
    if (carrier) {
      query = query.eq('carrier', carrier);
    }
    if (storage) {
      query = query.eq('storage', storage);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    // 노출기간 필터링 (현재 날짜가 노출기간 내에 있는 상품만)
    const today = new Date().toISOString().split('T')[0];
    query = query
      .lte('product_tables.exposure_start_date', today)
      .gte('product_tables.exposure_end_date', today)
      .eq('product_tables.is_active', true);

    // 페이지네이션은 중복 제거 후에 적용하므로 여기서는 제거

    console.log('Supabase 쿼리 실행 중...');
    const { data, error, count } = await query;
    console.log('Supabase 응답:', { data: data?.length || 0, error, count });

    if (error) {
      console.error('❌ 상품 조회 실패:', error);
      console.error('❌ 에러 코드:', error.code);
      console.error('❌ 에러 메시지:', error.message);
      console.error('❌ 전체 에러 객체:', JSON.stringify(error, null, 2));
      
      // 테이블이 존재하지 않는 경우 - 개발 중에는 빈 데이터 반환
      if (error.code === 'PGRST205' || error.message?.includes('relation "products" does not exist')) {
        console.log('✅ products 테이블이 존재하지 않습니다. 빈 데이터를 반환합니다.');
        return NextResponse.json({
          products: [],
          total: 0,
          page: 1,
          limit: 20
        });
      }
      
      // RLS 정책 문제
      if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
        console.log('❌ RLS 정책 문제');
        return NextResponse.json(
          { error: '데이터베이스 접근 권한이 없습니다. RLS 정책을 확인해주세요.', code: error.code },
          { status: 500 }
        );
      }
      
      console.log('❌ 기타 데이터베이스 에러');
      return NextResponse.json(
        { error: '상품 조회에 실패했습니다.', details: error.message, code: error.code },
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
      }
    }));

    // 중복 제거: 같은 모델+통신사+용량+조건 조합 중 최신 데이터만 유지
    const deduplicatedProducts = rawProducts.reduce((acc: ProductWithDetails[], product: ProductWithDetails) => {
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

    const products: ProductWithDetails[] = deduplicatedProducts;

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
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedProducts = filteredProducts.slice(from, to);

    const result: ProductSearchResult = {
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

// POST /api/products - 새로운 상품 생성
export async function POST(request: NextRequest) {
  try {
    const body: ProductCreateRequest = await request.json();
    const {
      storeId,
      deviceModelId,
      carrier,
      storage,
      price,
      conditions,
      isActive = true
    } = body;

    // 필수 필드 검증
    if (!storeId || !deviceModelId || !carrier || !storage || !price) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 가격 검증
    if (price <= 0) {
      return NextResponse.json(
        { error: '가격은 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        store_id: storeId,
        device_model_id: deviceModelId,
        carrier,
        storage,
        price,
        conditions: conditions || [],
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
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
      console.error('상품 생성 실패:', error);
      return NextResponse.json(
        { error: '상품 생성에 실패했습니다.', details: error.message },
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}