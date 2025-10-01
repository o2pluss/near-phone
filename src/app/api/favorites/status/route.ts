import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const storeId = searchParams.get('store_id');
    
    if (!userId || !storeId) {
      return NextResponse.json({ error: 'user_id and store_id are required' }, { status: 400 });
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization 헤더 없음');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // 토큰으로 사용자 확인
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !user) {
      console.error('인증 오류:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 클라이언트에서 전달받은 user_id와 인증된 사용자 ID가 일치하는지 확인
    if (user.id !== userId) {
      console.error('사용자 ID 불일치:', { authUserId: user.id, clientUserId: userId });
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }
    
    const { data, error } = await supabaseServer
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('즐겨찾기 상태 확인 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // PGRST116은 "not found" 오류 코드
    const isFavorite = !!data;
    
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('즐겨찾기 상태 확인 중 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
