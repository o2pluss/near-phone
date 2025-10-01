import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 키 클라이언트
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET - products 테이블 상태 확인
export async function GET(request: NextRequest) {
  try {
    console.log('=== products 테이블 상태 확인 ===');
    
    // 1. 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabaseService
      .from('products')
      .select('*')
      .limit(1);
    
    console.log('테이블 접근 테스트:', { tableError, hasData: !!tableInfo });
    
    // 2. 제약 조건 확인 (PostgreSQL 쿼리)
    const { data: constraints, error: constraintError } = await supabaseService
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            conname as constraint_name,
            contype as constraint_type,
            pg_get_constraintdef(oid) as constraint_definition
          FROM pg_constraint 
          WHERE conrelid = 'products'::regclass
          AND contype = 'u';
        `
      });
    
    console.log('제약 조건 확인:', { constraintError, constraints });
    
    // 3. 테스트 상품 삽입
    const testProduct = {
      store_id: '29ef94d2-6b27-4a74-852a-a8ce094638f1',
      device_model_id: 'fb6fa61d-3bda-4ec7-8c94-76c1662991cf',
      carrier: 'KT',
      storage: '128GB',
      price: 100000,
      conditions: ['번호이동'],
      is_active: true,
      table_id: '72c2bc98-bc8d-4714-badc-853d0cfe8267', // 실제 존재하는 테이블 ID 사용
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('테스트 상품 삽입 시도:', testProduct);
    
    const { data: insertedProduct, error: insertError } = await supabaseService
      .from('products')
      .insert([testProduct])
      .select();
    
    console.log('테스트 상품 삽입 결과:', { insertError, insertedProduct });
    
    return NextResponse.json({
      tableAccess: { error: tableError, hasData: !!tableInfo },
      constraints: { error: constraintError, data: constraints },
      testInsert: { error: insertError, data: insertedProduct }
    });
    
  } catch (error) {
    console.error('테스트 API 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - 제약 조건 제거 시도
export async function POST(request: NextRequest) {
  try {
    console.log('=== 제약 조건 제거 시도 ===');
    
    const { data, error } = await supabaseService
      .rpc('exec_sql', { 
        sql: `
          ALTER TABLE products 
          DROP CONSTRAINT IF EXISTS products_store_id_device_model_id_carrier_storage_condition_key;
        `
      });
    
    console.log('제약 조건 제거 결과:', { error, data });
    
    return NextResponse.json({ 
      success: !error, 
      error: error?.message,
      data 
    });
    
  } catch (error) {
    console.error('제약 조건 제거 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
