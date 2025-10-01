import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  const storeId = searchParams.get('store_id');
  
  console.log('=== 즐겨찾기 조회 API 시작 ===');
  console.log('요청 파라미터:', { userId, storeId });
  
  try {
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization 헤더 없음');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // 임시로 인증 우회 (개발용)
    console.log('인증 우회 모드 - 개발용');
    const user = { id: userId || 'test-user-id' };

    // 클라이언트에서 전달받은 user_id와 인증된 사용자 ID가 일치하는지 확인
    if (userId && user.id !== userId) {
      console.error('사용자 ID 불일치:', { authUserId: user.id, clientUserId: userId });
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // 인증된 사용자 ID 사용
    const actualUserId = userId || user.id;
    
    let query = supabaseServer
      .from('favorites')
      .select(`
        *,
        stores (
          id,
          name,
          address,
          phone,
          rating,
          review_count,
          latitude,
          longitude,
          hours
        )
      `);
    
    query = query.eq('user_id', actualUserId);
    if (storeId) query = query.eq('store_id', storeId);
    
    const { data, error } = await query;
    
    // 서비스 클라이언트를 상품 조회에 사용
    const serviceSupabase = supabaseServer;
    
    if (error) {
      console.error('즐겨찾기 조회 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // 즐겨찾기 데이터를 Store 형태로 변환
    const favoriteStores = (data || []).map((favorite: any) => {
      const store = favorite.stores;
      
      // 저장된 상품 스냅샷 사용
      const productSnapshot = favorite.product_snapshot;
      
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        distance: 0.5, // 실제로는 사용자 위치 기반 계산 필요
        phone: store.phone || '-',
        rating: store.rating || 0,
        reviewCount: store.review_count || 0,
        model: productSnapshot?.model || '상품 정보 없음',
        price: productSnapshot?.price || 0,
        conditions: productSnapshot?.conditions || [],
        hours: store.hours || '09:00 - 21:00',
        addedDate: new Date(favorite.created_at).toISOString().split('T')[0],
        productCarrier: (productSnapshot?.carrier || 'kt') as 'kt' | 'skt' | 'lgu',
        storage: productSnapshot?.storage || '256GB',
        productSnapshot: productSnapshot || {
          id: 'no-product',
          name: '상품 정보 없음',
          model: '상품 정보 없음',
          storage: '256GB',
          price: 0,
          carrier: 'kt',
          conditions: [],
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletionReason: '상품 정보를 찾을 수 없습니다'
        }
      };
    });
    
    return NextResponse.json({ data: favoriteStores });
  } catch (error) {
    console.error('즐겨찾기 조회 중 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== 즐겨찾기 추가 API 시작 ===');
    const body = await req.json();
    console.log('요청 본문:', body);
    
    const { user_id, store_id, product_id, product_snapshot } = body;
    console.log('파라미터:', { user_id, store_id, product_id, product_snapshot });
    
    if (!user_id || !store_id) {
      console.log('필수 파라미터 누락:', { user_id, store_id });
      return NextResponse.json({ error: 'user_id and store_id are required' }, { status: 400 });
    }

    // anonymous 사용자인 경우 처리
    if (user_id === 'anonymous') {
      console.log('익명 사용자는 즐겨찾기를 사용할 수 없습니다');
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.get('authorization');
    console.log('Authorization 헤더:', authHeader ? '존재' : '없음');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization 헤더 없음');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('토큰 길이:', token.length);
    
    // 토큰으로 사용자 확인
    console.log('사용자 인증 확인 중...');
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError) {
      console.error('인증 오류:', authError);
      return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 401 });
    }
    
    if (!user) {
      console.error('사용자 정보 없음');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    console.log('인증된 사용자:', { id: user.id, email: user.email });

    // 클라이언트에서 전달받은 user_id와 인증된 사용자 ID가 일치하는지 확인
    if (user.id !== user_id) {
      console.error('사용자 ID 불일치:', { authUserId: user.id, clientUserId: user_id });
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }
    
    // RLS를 우회하기 위해 서비스 키 사용
    const serviceSupabase = supabaseServer;
    
    // 중복 확인 (매장+상품 조합)
    console.log('중복 확인 중...');
    let query = serviceSupabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('store_id', store_id);
    
    // product_id가 있을 때만 조건 추가
    if (product_id) {
      query = query.eq('product_id', product_id);
    } else {
      query = query.is('product_id', null);
    }
    
    const { data: existing, error: checkError } = await query.single();
    
    console.log('중복 확인 결과:', { existing, checkError });
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('중복 확인 오류:', checkError);
      return NextResponse.json({ error: `Check error: ${checkError.message}` }, { status: 500 });
    }
    
    if (existing) {
      console.log('이미 즐겨찾기에 존재함');
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }
    
    console.log('즐겨찾기 추가 중...');
    const insertData: any = { 
      user_id, 
      store_id
    };
    
    // product_id가 있을 때만 추가
    if (product_id) {
      insertData.product_id = product_id;
    }
    
    // product_snapshot이 있을 때만 추가
    if (product_snapshot) {
      insertData.product_snapshot = product_snapshot;
    }
    console.log('삽입할 데이터:', insertData);
    
    const { data, error } = await serviceSupabase
      .from('favorites')
      .insert(insertData)
      .select()
      .single();
    
    console.log('삽입 결과:', { data, error });
    
    if (error) {
      console.error('즐겨찾기 추가 오류:', error);
      return NextResponse.json({ error: `Insert error: ${error.message}` }, { status: 500 });
    }
    
    console.log('즐겨찾기 추가 성공:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('즐겨찾기 추가 중 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const storeId = searchParams.get('store_id');
    
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization 헤더 없음');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // 임시로 인증 우회 (개발용)
    console.log('인증 우회 모드 - 개발용');
    const user = { id: userId || 'test-user-id' };

    // 클라이언트에서 전달받은 user_id와 인증된 사용자 ID가 일치하는지 확인
    if (userId && user.id !== userId) {
      console.error('사용자 ID 불일치:', { authUserId: user.id, clientUserId: userId });
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }
    
    let query = supabaseServer.from('favorites').delete();
    
    if (id) {
      query = query.eq('id', id);
    } else if (userId && storeId) {
      query = query.eq('user_id', userId).eq('store_id', storeId);
    } else {
      return NextResponse.json({ error: 'Specify id or user_id+store_id' }, { status: 400 });
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('즐겨찾기 삭제 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('즐겨찾기 삭제 중 오류:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



