import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { CARRIER_CODES, STORAGE_CODES } from '@/lib/constants/codes';

// carrier 값 정규화 함수
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

// storage 값 정규화 함수
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

// GET /api/store-search-sql - SQL 기반 최적화된 매장 찾기
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

    // 현재 날짜
    const today = new Date().toISOString().split('T')[0];
    
    // 동적 WHERE 조건 구성
    const whereConditions: string[] = [
      'p.is_active = true',
      'pt.is_active = true',
      `pt.exposure_start_date <= '${today}'`,
      `pt.exposure_end_date >= '${today}'`
    ];
    
    const params: any[] = [];
    let paramIndex = 1;
    
    if (storeId) {
      whereConditions.push(`p.store_id = $${paramIndex}`);
      params.push(storeId);
      paramIndex++;
    }
    
    if (carrier) {
      whereConditions.push(`p.carrier = $${paramIndex}`);
      params.push(carrier);
      paramIndex++;
    }
    
    if (minPrice) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      params.push(Number(minPrice));
      paramIndex++;
    }
    
    if (maxPrice) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      params.push(Number(maxPrice));
      paramIndex++;
    }
    
    if (storage) {
      whereConditions.push(`p.storage = $${paramIndex}`);
      params.push(storage);
      paramIndex++;
    }
    
    if (signupType) {
      whereConditions.push(`p.conditions @> $${paramIndex}`);
      params.push(`["${signupType}"]`);
      paramIndex++;
    }
    
    if (conditions) {
      const conditionArray = conditions.split(',').map(c => c.trim());
      const conditionJson = JSON.stringify(conditionArray);
      whereConditions.push(`p.conditions @> $${paramIndex}`);
      params.push(conditionJson);
      paramIndex++;
    }
    
    if (model) {
      whereConditions.push(`(dm.device_name ILIKE $${paramIndex} OR dm.model_name ILIKE $${paramIndex})`);
      params.push(`%${model}%`);
      paramIndex++;
    }
    
    if (cursor) {
      whereConditions.push(`p.created_at < $${paramIndex}`);
      params.push(cursor);
      paramIndex++;
    }
    
    // 최적화된 SQL 쿼리
    const sql = `
      WITH active_tables AS (
        SELECT 
          pt.id,
          pt.store_id,
          pt.created_at,
          ROW_NUMBER() OVER (PARTITION BY pt.store_id ORDER BY pt.created_at DESC) as rn
        FROM product_tables pt
        WHERE pt.is_active = true
          AND pt.exposure_start_date <= $1
          AND pt.exposure_end_date >= $1
      ),
      latest_tables AS (
        SELECT id, store_id
        FROM active_tables
        WHERE rn = 1
      )
      SELECT 
        p.id,
        p.store_id,
        p.device_model_id,
        p.carrier,
        p.storage,
        p.price,
        p.conditions,
        p.is_active,
        p.created_at,
        p.updated_at,
        dm.id as dm_id,
        dm.manufacturer,
        dm.device_name,
        dm.model_name,
        dm.image_url,
        pt.id as pt_id,
        pt.name as pt_name,
        pt.exposure_start_date,
        pt.exposure_end_date,
        s.id as s_id,
        s.name as s_name,
        s.address,
        s.phone,
        s.rating,
        s.review_count,
        s.hours,
        s.latitude,
        s.longitude
      FROM products p
      INNER JOIN latest_tables lt ON p.table_id = lt.id AND p.store_id = lt.store_id
      INNER JOIN device_models dm ON p.device_model_id = dm.id
      INNER JOIN product_tables pt ON p.table_id = pt.id
      INNER JOIN stores s ON p.store_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
    `;
    
    // 쿼리 실행
    const { data, error } = await supabaseServer.rpc('execute_sql', {
      sql,
      params: [today, ...params, limit]
    });
    
    if (error) {
      console.error('SQL query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }
    
    // 데이터 변환
    const transformedData = data.map((item: any) => ({
      id: item.id,
      store_id: item.store_id,
      device_model_id: item.device_model_id,
      carrier: item.carrier,
      storage: item.storage,
      price: item.price,
      conditions: item.conditions || [],
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      device_models: {
        id: item.dm_id,
        manufacturer: item.manufacturer,
        device_name: item.device_name,
        model_name: item.model_name,
        image_url: item.image_url
      },
      product_tables: {
        id: item.pt_id,
        name: item.pt_name,
        exposure_start_date: item.exposure_start_date,
        exposure_end_date: item.exposure_end_date
      },
      stores: {
        id: item.s_id,
        name: item.s_name,
        address: item.address,
        phone: item.phone,
        rating: item.rating,
        review_count: item.review_count,
        hours: item.hours || '09:00 - 21:00',
        latitude: item.latitude,
        longitude: item.longitude
      }
    }));
    
    const nextCursor = data.length === limit ? data[data.length - 1].created_at : null;
    return NextResponse.json({ items: transformedData, nextCursor });
  } catch (error) {
    console.error('SQL store search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
