import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  const carrier = searchParams.get('carrier'); // kt | skt | lgu
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const storage = searchParams.get('storage'); // 128gb | 256gb | 512gb | 1tb
  const signupType = searchParams.get('signupType'); // 번호이동 | 신규가입 | 기기변경
  const conditions = searchParams.get('conditions'); // comma-separated conditions
  const q = searchParams.get('q'); // 모델명 검색
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? '15');

  let query = supabase
    .from('store_products')
    .select('*, products(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (storeId) query = query.eq('store_id', storeId);
  if (carrier) query = query.eq('carrier', carrier);
  if (minPrice) query = query.gte('price', Number(minPrice));
  if (maxPrice) query = query.lte('price', Number(maxPrice));
  if (storage) query = query.eq('storage', storage);
  if (signupType) query = query.eq('signup_type', signupType);
  if (conditions) {
    const conditionArray = conditions.split(',').map(c => c.trim());
    // text 타입이므로 각 조건을 포함하는지 ilike로 검색
    for (const condition of conditionArray) {
      query = query.ilike('conditions', `%${condition}%`);
    }
  }
  if (q) {
    // 모델명으로 products 테이블의 name 컬럼 검색
    query = query.ilike('products.name', `%${q}%`);
  }
  if (cursor) query = query.lt('created_at', cursor);
  
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: data ?? [], nextCursor });
}


