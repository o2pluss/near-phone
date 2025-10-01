import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { convertKeysToTexts, convertTextsToKeys, type AdditionalConditionKey } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  const carrier = searchParams.get('carrier'); // kt | skt | lgu
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const storage = searchParams.get('storage'); // 128gb | 256gb | 512gb | 1tb
  const signupType = searchParams.get('signupType'); // 번호이동 | 신규가입 | 기기변경
  const conditions = searchParams.get('conditions'); // comma-separated conditions
  const model = searchParams.get('model'); // 모델명 검색
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
  if (model) {
    // 모델명으로 products 테이블의 name 컬럼 검색
    query = query.ilike('products.name', `%${model}%`);
  }
  if (cursor) query = query.lt('created_at', cursor);
  
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // 데이터 변환 (텍스트를 KEY로 변환)
  const transformedData = data?.map(item => {
    if (item.conditions) {
      // conditions 문자열을 배열로 변환하고 KEY로 변환
      const conditionTexts = typeof item.conditions === 'string' 
        ? item.conditions.split(',').map((c: string) => c.trim())
        : item.conditions;
      
      const additionalConditionTexts = conditionTexts.filter((c: string) => 
        !['번호이동', '기기변경'].includes(c)
      );
      const additionalConditionKeys = convertTextsToKeys(additionalConditionTexts);
      const convertedAdditionalConditions = convertKeysToTexts(additionalConditionKeys);
      
      return {
        ...item,
        conditions: convertedAdditionalConditions
      };
    }
    return item;
  }) ?? [];
  
  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: transformedData, nextCursor });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, products } = body;

    if (!storeId || !products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'storeId and products array are required' }, { status: 400 });
    }

    // 상품 데이터 변환 (KEY를 텍스트로 변환)
    const transformedProducts = products.map((product: any) => {
      const { conditions, ...rest } = product;
      
      // conditions 배열에서 추가 조건들을 KEY에서 텍스트로 변환
      const additionalConditionTexts = conditions.filter((c: string) => 
        !['번호이동', '기기변경'].includes(c)
      );
      const additionalConditionKeys = convertTextsToKeys(additionalConditionTexts);
      const convertedAdditionalConditions = convertKeysToTexts(additionalConditionKeys);
      
      return {
        ...rest,
        conditions: convertedAdditionalConditions.join(',')
      };
    });

    // store_products 테이블에 저장
    const { data, error } = await supabase
      .from('store_products')
      .insert(transformedProducts.map(product => ({
        store_id: storeId,
        product_id: product.productId,
        price: product.price,
        carrier: product.carrier,
        storage: product.storage,
        signup_type: product.condition,
        conditions: product.conditions,
        is_available: product.isActive ?? true
      })))
      .select();

    if (error) {
      console.error('Store products insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Products saved successfully', 
      data: data 
    });

  } catch (error) {
    console.error('Store products API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
