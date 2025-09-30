import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CARRIER_CODES, STORAGE_CODES } from '@/lib/constants/codes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    
    let query = supabase
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
      .eq('product_tables.is_active', true)
      // 노출 기간 필터링: 현재 날짜가 노출 기간에 포함되는지 확인
      .lte('product_tables.exposure_start_date', today)
      .gte('product_tables.exposure_end_date', today)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (storeId) query = query.eq('store_id', storeId);
    if (carrier) query = query.eq('carrier', carrier);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (storage) query = query.eq('storage', storage);
    if (signupType) {
      // signupType을 conditions 배열에서 검색
      query = query.contains('conditions', [signupType]);
    }
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      // conditions 배열에서 각 조건을 포함하는지 검색
      for (const condition of conditionArray) {
        query = query.contains('conditions', [condition]);
      }
    }
    if (q) {
      // 모델명으로 device_models 테이블의 device_name 또는 model_name 검색
      // 관계된 테이블에서는 별도의 쿼리로 처리
      const deviceModelQuery = await supabase
        .from('device_models')
        .select('id')
        .or(`device_name.ilike.%${q}%,model_name.ilike.%${q}%`);
        
      if (deviceModelQuery.data && deviceModelQuery.data.length > 0) {
        const deviceModelIds = deviceModelQuery.data.map(dm => dm.id);
        query = query.in('device_model_id', deviceModelIds);
      } else {
        // 검색 결과가 없으면 빈 배열 반환
        return NextResponse.json({ items: [], nextCursor: null });
      }
    }
    if (cursor) query = query.lt('created_at', cursor);
    
    const { data, error } = await query;
    if (error) {
      console.error('Store search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 데이터 변환 (매장 찾기에 맞는 형태로)
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
          exposure_end_date: product_tables.exposure_end_date,
          is_active: product_tables.is_active
        },
        stores: {
          id: stores.id,
          name: stores.name,
          address: stores.address,
          phone: stores.phone,
          rating: stores.rating,
          review_count: stores.review_count,
          hours: stores.hours
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