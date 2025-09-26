import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log('🔗 Supabase 연결 테스트 시작');
    
    // device_models 테이블 존재 확인
    const { data, error } = await supabase
      .from('device_models')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase 에러:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      });
    }
    
    console.log('✅ Supabase 연결 성공');
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase 연결 정상',
      deviceModelsCount: data?.length || 0
    });
  } catch (err) {
    console.error('Supabase 연결 실패:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
