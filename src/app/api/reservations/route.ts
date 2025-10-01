import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

// 인증을 위한 Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'AUTH_INVALID', message: '유효하지 않은 인증 토큰입니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const cursor = searchParams.get('cursor');
    const limit = Number(searchParams.get('limit') ?? '15');
    
    // 검색/필터 파라미터
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchQuery = searchParams.get('search') ? decodeURIComponent(searchParams.get('search')!) : null;

    console.log('예약 목록 조회 요청:', {
      userId: user.id,
      storeId,
      limit,
      status,
      startDate,
      endDate
    });

    // Supabase 쿼리 빌더
    let query = supabaseServer
      .from('reservations')
      .select(`
        *,
        stores!inner(name, address, phone)
      `)
      .order('created_at', { ascending: false });

    // 사용자 역할에 따른 필터링
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    console.log('사용자 프로필:', { userId: user.id, role: profile?.role });

    // 임시로 모든 사용자가 모든 예약을 볼 수 있도록 설정 (테스트용)
    if (storeId) {
      console.log('매장 필터 적용:', storeId);
      query = query.eq('store_id', storeId);
    } else {
      console.log('모든 예약 조회 (테스트 모드)');
    }
    
    // 원래 로직 (주석 처리)
    // if (profile?.role === 'seller' || profile?.role === 'admin') {
    //   // 판매자/관리자는 매장 필터가 있으면 해당 매장의 예약만, 없으면 모든 예약 조회
    //   if (storeId) {
    //     console.log('매장 필터 적용:', storeId);
    //     query = query.eq('store_id', storeId);
    //   } else {
    //     console.log('모든 예약 조회 (판매자/관리자 권한)');
    //   }
    // } else {
    //   // 일반 사용자는 자신의 예약만 조회
    //   console.log('사용자 예약만 조회:', user.id);
    //   query = query.eq('user_id', user.id);
    // }
    
    // 상태 필터 (여러 상태 지원: "confirmed,completed")
    if (status && status !== 'all') {
      const statusList = status.split(',').map(s => s.trim());
      query = query.in('status', statusList);
    }
    
    // 날짜 필터 (예약 날짜 기준)
    if (startDate) {
      query = query.gte('reservation_date', startDate);
    }
    if (endDate) {
      query = query.lte('reservation_date', endDate);
    }
    
    // 검색 필터
    if (searchQuery) {
      query = query.or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%,store_snapshot->name.ilike.%${searchQuery}%`);
    }
    
    // 페이지네이션
    if (cursor) {
      query = query.range(parseInt(cursor), parseInt(cursor) + limit - 1);
    } else {
      query = query.range(0, limit - 1);
    }
    
    const { data: reservations, error } = await query;
    
    console.log('쿼리 실행 결과:', {
      reservationsCount: reservations?.length || 0,
      error: error?.message,
      hasError: !!error
    });
    
    if (error) {
      console.error('예약 목록 조회 에러:', error);
      return NextResponse.json({ error: '예약 목록을 불러올 수 없습니다.' }, { status: 500 });
    }
    
    const nextCursor = reservations && reservations.length === limit ? 
      (cursor ? parseInt(cursor) + limit : limit).toString() : null;
    
    console.log('최종 응답:', {
      itemsCount: reservations?.length || 0,
      nextCursor
    });
    
    return NextResponse.json({ items: reservations || [], nextCursor });
  } catch (error) {
    console.error('예약 목록 조회 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED', message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'AUTH_INVALID', message: '유효하지 않은 인증 토큰입니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    console.log('예약 생성 요청 데이터:', body);
    console.log('인증된 사용자 ID:', user.id);
    
    // 필수 필드 검증
    const requiredFields = ['store_id', 'reservation_date', 'reservation_time', 'customer_name', 'customer_phone'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error('필수 필드 누락:', missingFields);
      return NextResponse.json({ 
        error: 'MISSING_FIELDS',
        message: '필수 필드가 누락되었습니다.',
        missingFields 
      }, { status: 400 });
    }
    
    // 오늘 날짜인 경우 현재 시간 이후만 예약 가능하도록 검증
    const reservationDate = new Date(body.reservation_date);
    const today = new Date();
    const isToday = reservationDate.toDateString() === today.toDateString();
    
    if (isToday) {
      const [timeHour, timeMinute] = body.reservation_time.split(':').map(Number);
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      
      // 현재 시간보다 이전인지 확인
      const isPastTime = timeHour < currentHour || 
                        (timeHour === currentHour && timeMinute <= currentMinute);
      
      if (isPastTime) {
        console.error('과거 시간 예약 시도:', {
          reservation_time: body.reservation_time,
          current_time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        });
        return NextResponse.json({
          error: 'PAST_TIME',
          message: '오늘 날짜는 현재 시간 이후만 예약 가능합니다.',
          details: {
            reservation_time: body.reservation_time,
            current_time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
          }
        }, { status: 400 });
      }
    }
    
    // UUID 유효성 검증 함수
    const isValidUUID = (uuid: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };
    
    // product_id와 store_product_id 유효성 검증 및 정리
    const cleanProductId = body.product_id && isValidUUID(body.product_id) ? body.product_id : null;
    const cleanStoreProductId = body.store_product_id && isValidUUID(body.store_product_id) ? body.store_product_id : null;
    
    console.log('Product ID 검증:', {
      original: body.product_id,
      cleaned: cleanProductId,
      isValid: isValidUUID(body.product_id || '')
    });
    
    console.log('Store Product ID 검증:', {
      original: body.store_product_id,
      cleaned: cleanStoreProductId,
      isValid: isValidUUID(body.store_product_id || '')
    });
    
    // 인증된 사용자의 ID를 사용
    const reservationData = {
      store_id: body.store_id,
      product_id: cleanProductId,
      store_product_id: cleanStoreProductId,
      reservation_date: body.reservation_date,
      reservation_time: body.reservation_time,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      memo: body.memo || null,
      product_snapshot: body.product_snapshot || null,
      store_snapshot: body.store_snapshot || null,
      user_id: user.id, // 인증된 사용자 ID
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('예약 데이터:', reservationData);
    
    // 중복 예약 체크
    const { data: existingReservations, error: checkError } = await supabaseServer
      .from('reservations')
      .select('id')
      .eq('store_id', body.store_id)
      .eq('reservation_date', body.reservation_date)
      .eq('reservation_time', body.reservation_time)
      .in('status', ['pending', 'confirmed']);
    
    if (checkError) {
      console.error('중복 예약 체크 에러:', checkError);
      return NextResponse.json({ 
        error: 'CHECK_ERROR',
        message: '중복 예약 체크 중 오류가 발생했습니다.',
        details: checkError 
      }, { status: 500 });
    }
    
    if (existingReservations && existingReservations.length > 0) {
      return NextResponse.json(
        { 
          error: 'DUPLICATE_RESERVATION',
          message: '해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.',
          details: {
            store_id: body.store_id,
            reservation_date: body.reservation_date,
            reservation_time: body.reservation_time
          }
        }, 
        { status: 409 }
      );
    }
    
    // 예약 생성
    const { data: newReservation, error } = await supabaseServer
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();
    
    if (error) {
      console.error('예약 생성 에러:', error);
      return NextResponse.json({ 
        error: 'CREATE_ERROR',
        message: '예약 생성에 실패했습니다.',
        details: error 
      }, { status: 500 });
    }
    
    console.log('예약 생성 성공:', newReservation);
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('예약 생성 실패:', error);
    return NextResponse.json({ 
      error: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 모든 예약 데이터 삭제 (개발/테스트용)
    const { error } = await supabaseServer
      .from('reservations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 레코드 삭제
    
    if (error) {
      console.error('예약 전체 삭제 에러:', error);
      return NextResponse.json({ error: '예약 삭제에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ message: '모든 예약 데이터가 삭제되었습니다.' });
  } catch (error) {
    console.error('예약 전체 삭제 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}