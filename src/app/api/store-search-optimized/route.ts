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

// GET /api/store-search-optimized - 최적화된 매장 찾기용 상품 검색
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const carrier = normalizeCarrier(searchParams.get('carrier'));
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const storage = normalizeStorage(searchParams.get('storage'));
    const signupType = searchParams.get('signupType');
    const conditions = searchParams.get('conditions');
    const model = searchParams.get('model');
    const cursor = searchParams.get('cursor');
    const limit = Number(searchParams.get('limit') ?? '15');

    // 현재 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    
    // 모델명 검색 시 device_model_id 먼저 조회
    let deviceModelIds: string[] | undefined;
    if (model) {
      const { data: models } = await supabaseServer
        .from('device_models')
        .select('id')
        .or(`device_name.ilike.%${model}%,model_name.ilike.%${model}%`);
      
      if (!models || models.length === 0) {
        return NextResponse.json({ items: [], nextCursor: null });
      }
      deviceModelIds = models.map(m => m.id);
    }
    
    // 최적화된 단일 쿼리로 모든 로직 처리
    let query = supabaseServer
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
          is_active,
          created_at
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
      .eq('product_tables.is_active', true)
      .lte('product_tables.exposure_start_date', today)
      .gte('product_tables.exposure_end_date', today)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // 중복 제거를 위해 더 많이 가져옴
    
    // 사용자 조건 적용
    if (storeId) query = query.eq('store_id', storeId);
    if (carrier) query = query.eq('carrier', carrier);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (storage) query = query.eq('storage', storage);
    if (signupType) {
      query = query.contains('conditions', [signupType]);
    }
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      for (const condition of conditionArray) {
        query = query.contains('conditions', [condition]);
      }
    }
    if (deviceModelIds) {
      query = query.in('device_model_id', deviceModelIds);
    }
    if (cursor) query = query.lt('created_at', cursor);
    
    const { data, error } = await query;
    if (error) {
      console.error('Optimized query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }
    
    // 매장별로 그룹화하여 각 매장의 최신 테이블에서만 상품 선택
    const storeTableMap = new Map<string, string>();
    const productsByStore = new Map<string, any[]>();
    
    // 매장별로 그룹화
    data.forEach(item => {
      const storeId = item.store_id;
      if (!productsByStore.has(storeId)) {
        productsByStore.set(storeId, []);
      }
      productsByStore.get(storeId)!.push(item);
    });
    
    // 각 매장별로 가장 최근 테이블의 상품만 선택
    const finalProducts: any[] = [];
    for (const [storeId, products] of productsByStore) {
      // 같은 테이블의 상품들을 그룹화
      const productsByTable = new Map<string, any[]>();
      products.forEach(product => {
        const tableId = product.table_id;
        if (!productsByTable.has(tableId)) {
          productsByTable.set(tableId, []);
        }
        productsByTable.get(tableId)!.push(product);
      });
      
      // 가장 최근 테이블 선택 (created_at 기준)
      let latestTableId = '';
      let latestTableDate = '';
      
      for (const [tableId, tableProducts] of productsByTable) {
        const tableCreatedAt = tableProducts[0].product_tables.created_at;
        if (tableCreatedAt > latestTableDate) {
          latestTableDate = tableCreatedAt;
          latestTableId = tableId;
        }
      }
      
      // 최신 테이블의 상품들만 추가
      if (latestTableId && productsByTable.has(latestTableId)) {
        finalProducts.push(...productsByTable.get(latestTableId)!);
      }
    }
    
    // 최종 결과 정렬 및 제한
    const sortedProducts = finalProducts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    // 데이터 변환
    const transformedData = sortedProducts.map(item => {
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
    });
    
    const nextCursor = sortedProducts.length === limit ? sortedProducts[sortedProducts.length - 1].created_at : null;
    return NextResponse.json({ items: transformedData, nextCursor });
  } catch (error) {
    console.error('Optimized store search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
