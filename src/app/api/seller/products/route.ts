import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductCreateRequest, ProductSearchRequest, ProductSearchResult, ProductWithDetails } from '@/types/product';
import { CarrierCode, StorageCode } from '@/lib/constants/codes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/seller/products - 판매자용 상품 목록 조회 (인증 필요)
export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/seller/products API 호출됨 (판매자용)');
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

    const { searchParams } = new URL(request.url);
    const deviceModelId = searchParams.get('deviceModelId');
    const carrier = searchParams.get('carrier') as CarrierCode;
    const storage = searchParams.get('storage') as StorageCode;
    const manufacturer = searchParams.get('manufacturer');
    const model = searchParams.get('model');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('요청 파라미터:', { deviceModelId, carrier, storage, manufacturer, model, isActive, page, limit });

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
      .eq('store_id', storeData.id) // 스토어별 필터링
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
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    // 노출기간 필터링 (현재 날짜가 노출기간 내에 있는 상품만)
    const today = new Date().toISOString().split('T')[0];
    query = query
      .lte('product_tables.exposure_start_date', today)
      .gte('product_tables.exposure_end_date', today)
      .eq('product_tables.is_active', true);

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
    const fromFiltered = (page - 1) * limit;
    const toFiltered = fromFiltered + limit;
    const paginatedProducts = filteredProducts.slice(fromFiltered, toFiltered);

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

// POST /api/seller/products - 판매자용 새로운 상품 생성 (인증 필요)
export async function POST(request: NextRequest) {
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

    // 스토어 ID 검증 (요청한 storeId가 현재 사용자의 스토어인지 확인)
    if (storeId !== storeData.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

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
