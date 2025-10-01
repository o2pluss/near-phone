import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { CARRIER_CODES, STORAGE_CODES } from '@/lib/constants/codes';

// carrier 값 정규화 함수 (소문자 -> 대문자)
function normalizeCarrier(carrier: string | null): string | null {
  if (!carrier) return null;
  
  const carrierMap: Record<string, string> = {
    'kt': CARRIER_CODES.KT,
    'skt': CARRIER_CODES.SKT,
    'lgu': CARRIER_CODES.LG_U_PLUS,
    'lg_u_plus': CARRIER_CODES.LG_U_PLUS,
    'lgu+': CARRIER_CODES.LG_U_PLUS
  };
  
  return carrierMap[carrier.toLowerCase()] || carrier.toUpperCase();
}

// storage 값 정규화 함수 (소문자 -> 대문자)
function normalizeStorage(storage: string | null): string | null {
  if (!storage) return null;
  
  const storageMap: Record<string, string> = {
    '128gb': STORAGE_CODES.GB_128,
    '256gb': STORAGE_CODES.GB_256,
    '512gb': STORAGE_CODES.GB_512,
    '1tb': STORAGE_CODES.TB_1
  };
  
  return storageMap[storage.toLowerCase()] || storage.toUpperCase();
}

// GET /api/store-search - 매장 찾기용 상품 검색
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId'); // 특정 매장의 상품만 조회
    const carrier = normalizeCarrier(searchParams.get('carrier')); // kt | skt | lgu -> KT | SKT | LG_U_PLUS
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const storage = normalizeStorage(searchParams.get('storage')); // 128gb | 256gb | 512gb | 1tb -> 128GB | 256GB | 512GB | 1TB
    const signupType = searchParams.get('signupType'); // 번호이동 | 신규가입 | 기기변경
    const conditions = searchParams.get('conditions'); // comma-separated conditions
    const q = searchParams.get('q'); // 모델명 검색
    const cursor = searchParams.get('cursor');
    const limit = Number(searchParams.get('limit') ?? '15');

    // 현재 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    
    // 1단계: 사용자 조건에 맞는 상품이 있는 노출 가능한 테이블 찾기
    let productQuery = supabaseServer
      .from('products')
      .select('store_id, table_id, device_model_id')
      .eq('is_active', true);
    
    // 사용자 조건 적용
    if (storeId) productQuery = productQuery.eq('store_id', storeId);
    if (carrier) productQuery = productQuery.eq('carrier', carrier);
    if (minPrice) productQuery = productQuery.gte('price', Number(minPrice));
    if (maxPrice) productQuery = productQuery.lte('price', Number(maxPrice));
    if (storage) productQuery = productQuery.eq('storage', storage);
    if (signupType) {
      productQuery = productQuery.contains('conditions', [signupType]);
    }
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      for (const condition of conditionArray) {
        productQuery = productQuery.contains('conditions', [condition]);
      }
    }
    
    // 모델명 검색 처리
    if (q) {
      const deviceModelQuery = await supabaseServer
        .from('device_models')
        .select('id')
        .or(`device_name.ilike.%${q}%,model_name.ilike.%${q}%`);
        
      if (deviceModelQuery.data && deviceModelQuery.data.length > 0) {
        const deviceModelIds = deviceModelQuery.data.map(dm => dm.id);
        productQuery = productQuery.in('device_model_id', deviceModelIds);
      } else {
        return NextResponse.json({ items: [], nextCursor: null });
      }
    }
    
    const { data: matchingProducts, error: productError } = await productQuery;
    if (productError) {
      console.error('Product search error:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }
    
    if (!matchingProducts || matchingProducts.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }
    
    // 2단계: 각 매장별로 현재 노출 가능한 테이블 중 가장 최근 테이블 찾기
    const storeTableMap = new Map<string, string>();
    
    // 매장별로 그룹화
    const productsByStore = matchingProducts.reduce((acc, product) => {
      const { store_id } = product;
      if (!acc[store_id]) {
        acc[store_id] = [];
      }
      acc[store_id].push(product);
      return acc;
    }, {} as Record<string, any[]>);
    
    // 각 매장별로 처리
    for (const [store_id, products] of Object.entries(productsByStore)) {
      // 해당 매장의 상품이 있는 테이블들 조회
      const tableIds = [...new Set(products.map(p => p.table_id))];
      
      const { data: storeTables, error: storeTablesError } = await supabaseServer
        .from('product_tables')
        .select('id, created_at')
        .in('id', tableIds)
        .eq('is_active', true)
        .lte('exposure_start_date', today)
        .gte('exposure_end_date', today)
        .order('created_at', { ascending: false });
      
      if (storeTablesError || !storeTables || storeTables.length === 0) continue;
      
      // 가장 최근 테이블 선택
      storeTableMap.set(store_id, storeTables[0].id);
    }
    
    if (storeTableMap.size === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }
    
    // 3단계: 각 매장의 최신 테이블에서 사용자 조건에 맞는 상품 조회
    const tableIds = Array.from(storeTableMap.values());
    
    let finalQuery = supabaseServer
      .from('products')
      .select(`
        *,
        device_models!inner(
          id,
          manufacturer,
          device_name,
          model_name,
          image_url
        ),
        product_tables!inner(
          id,
          name,
          exposure_start_date,
          exposure_end_date,
          is_active
        ),
        stores!inner(
          id,
          name,
          address,
          phone,
          rating,
          review_count,
          hours
        )
      `)
      .eq('is_active', true)
      .in('table_id', tableIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // 사용자 조건 재적용
    if (storeId) finalQuery = finalQuery.eq('store_id', storeId);
    if (carrier) finalQuery = finalQuery.eq('carrier', carrier);
    if (minPrice) finalQuery = finalQuery.gte('price', Number(minPrice));
    if (maxPrice) finalQuery = finalQuery.lte('price', Number(maxPrice));
    if (storage) finalQuery = finalQuery.eq('storage', storage);
    if (signupType) {
      finalQuery = finalQuery.contains('conditions', [signupType]);
    }
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      for (const condition of conditionArray) {
        finalQuery = finalQuery.contains('conditions', [condition]);
      }
    }
    if (q) {
      // 1단계에서 찾은 device_model_id들로 필터링
      const deviceModelIds = [...new Set(matchingProducts.map(p => p.device_model_id))];
      finalQuery = finalQuery.in('device_model_id', deviceModelIds);
    }
    if (cursor) finalQuery = finalQuery.lt('created_at', cursor);
    
    const { data, error } = await finalQuery;
    if (error) {
      console.error('Final query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 데이터 변환
    const transformedData = data?.map(item => {
      const { device_models, product_tables, stores, conditions, ...rest } = item;
      
      return {
        id: item.id,
        store_id: item.store_id,
        device_model_id: item.device_model_id,
        carrier: item.carrier,
        storage: item.storage,
        price: item.price,
        conditions: conditions || [],
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        device_models: {
          id: device_models.id,
          manufacturer: device_models.manufacturer,
          device_name: device_models.device_name,
          model_name: device_models.model_name,
          image_url: device_models.image_url
        },
        product_tables: {
          id: product_tables.id,
          name: product_tables.name,
          exposure_start_date: product_tables.exposure_start_date,
          exposure_end_date: product_tables.exposure_end_date
        },
        stores: {
          id: stores.id,
          name: stores.name,
          address: stores.address,
          phone: stores.phone,
          rating: stores.rating,
          review_count: stores.review_count,
          hours: stores.hours || '09:00 - 21:00'
        }
      };
    }) ?? [];
    
    const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
    return NextResponse.json({ items: transformedData, nextCursor });
  } catch (error) {
    console.error('Store search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}