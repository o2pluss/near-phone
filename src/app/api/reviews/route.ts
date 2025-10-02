import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드에서 RLS 우회를 위한 서비스 키 클라이언트
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? '15');

  let query = supabase
    .from('reviews')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (storeId) query = query.eq('store_id', storeId);
  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // 사용자 ID 목록 추출
  const userIds = data?.map(review => review.user_id) ?? [];
  const uniqueUserIds = [...new Set(userIds)];

  // 사용자 프로필 정보 조회
  const { data: profiles, error: profileError } = await supabaseService
    .from('profiles')
    .select('user_id, name')
    .in('user_id', uniqueUserIds);

  console.log('프로필 조회 결과:', { profiles, profileError, uniqueUserIds });

  if (profileError) {
    console.error('프로필 조회 오류:', profileError);
  }

  // 프로필 데이터를 Map으로 변환
  const profileMap = new Map();
  profiles?.forEach(profile => {
    profileMap.set(profile.user_id, profile.name);
  });

  // 데이터 변환 (profiles 정보를 userName으로 매핑)
  const transformedData = data?.map(review => ({
    ...review,
    userName: profileMap.get(review.user_id) || '익명',
    storeName: undefined // 필요시 stores 테이블과 JOIN
  })) ?? [];

  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: transformedData, nextCursor });
}

export async function POST(req: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { storeId, reservationId, rating, content } = body;

    console.log('리뷰 작성 요청:', { storeId, reservationId, rating, content: content?.substring(0, 50) + '...' });
    console.log('사용자 ID:', user.id);

    // 필수 필드 검증
    if (!storeId || !rating || !content) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 별점 범위 검증
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1-5 사이여야 합니다.' },
        { status: 400 }
      );
    }

    // 리뷰 내용 길이 검증
    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: '리뷰는 최소 10자 이상 작성해주세요.' },
        { status: 400 }
      );
    }

    // 예약 정보는 필수
    if (!reservationId || reservationId.trim() === '') {
      return NextResponse.json(
        { error: '예약 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 예약 조회 (RLS 우회를 위해 서비스 키 사용)
    const { data: reservations, error: reservationError } = await supabaseService
      .from('reservations')
      .select('id, user_id, store_id, status')
      .eq('id', reservationId);

    if (reservationError) {
      console.error('예약 조회 오류:', reservationError);
      return NextResponse.json(
        { error: `예약 정보 조회 실패: ${reservationError.message}` },
        { status: 500 }
      );
    }

    if (!reservations || reservations.length === 0) {
      console.log('예약을 찾을 수 없음:', { reservationId, storeId, userId: user.id });
      console.log('전체 예약 조회 결과:', allReservations);
      return NextResponse.json(
        { error: '예약 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const reservation = reservations[0];
    console.log('찾은 예약 정보:', reservation);

    // 예약이 완료된 상태인지 확인 (completed 상태에서만 리뷰 작성 가능)
    if (reservation.status !== 'completed') {
      return NextResponse.json(
        { error: `완료된 예약에만 리뷰를 작성할 수 있습니다. 현재 상태: ${reservation.status}` },
        { status: 400 }
      );
    }

    // 예약이 해당 사용자의 것인지 확인
    if (reservation.user_id !== user.id) {
      return NextResponse.json(
        { error: '본인의 예약에만 리뷰를 작성할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 예약이 해당 매장의 것인지 확인
    if (reservation.store_id !== storeId) {
      return NextResponse.json(
        { error: '예약과 매장이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 중복 리뷰 확인 (같은 예약에 대한 리뷰가 이미 있는지)
    const { data: existingReviews, error: checkError } = await supabaseService
      .from('reviews')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('user_id', user.id);

    if (checkError) {
      console.error('중복 리뷰 확인 오류:', checkError);
      return NextResponse.json(
        { error: '리뷰 중복 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (existingReviews && existingReviews.length > 0) {
      return NextResponse.json(
        { error: '이미 해당 예약에 대한 리뷰를 작성하셨습니다.' },
        { status: 400 }
      );
    }

    // 리뷰 생성
    const reviewData = {
      user_id: user.id,
      store_id: storeId,
      reservation_id: reservationId || null,
      rating,
      content: content.trim(),
      status: 'active'
    };

    console.log('리뷰 생성 데이터:', reviewData);

    const { data: newReview, error: insertError } = await supabaseService
      .from('reviews')
      .insert(reviewData)
      .select('*')
      .single();

    if (insertError) {
      console.error('리뷰 생성 오류:', insertError);
      console.error('오류 상세:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return NextResponse.json(
        { error: `리뷰 생성에 실패했습니다: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('리뷰 생성 성공:', newReview);

    // 사용자 이름 조회
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('사용자 프로필 조회 오류:', profileError);
    }

    // 매장 평점 업데이트 (트랜잭션으로 처리)
    const { error: updateError } = await supabaseService.rpc('update_store_rating', {
      store_id: storeId
    });

    if (updateError) {
      console.error('매장 평점 업데이트 오류:', updateError);
      // 리뷰는 생성되었으므로 경고만 로그에 남기고 성공 응답
    }

    // 응답 데이터 변환
    const responseData = {
      ...newReview,
      userName: profile?.name || '익명'
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('리뷰 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
