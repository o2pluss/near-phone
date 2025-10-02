import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드에서 RLS 우회를 위한 서비스 키 클라이언트
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const userName = searchParams.get('userName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId가 필요합니다.' }, { status: 400 });
    }

    // 리뷰를 메인으로 조회하고 예약 정보를 JOIN하는 쿼리
    let query = supabaseService
      .from('reviews')
      .select(`
        id,
        reservation_id,
        rating,
        content,
        created_at,
        reservations!inner(
          id,
          store_id,
          user_id,
          reservation_date,
          reservation_time,
          customer_name,
          customer_phone,
          memo,
          status,
          created_at,
          product_snapshot,
          stores!inner(
            id,
            name,
            address,
            phone
          )
        )
      `)
      .eq('reservations.store_id', storeId)
      .eq('reservations.status', 'completed'); // 완료된 예약만

    // 사용자명 필터 (customer_name 사용)
    if (userName) {
      query = query.ilike('reservations.customer_name', `%${userName}%`);
    }

    // 날짜 범위 필터 (리뷰 작성일 기준)
    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`);
    }

    // 별점 필터
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    // 정렬
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('rating', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('리뷰 조회 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 데이터 변환
    const transformedData = data?.map(review => {
      const productSnapshot = review.reservations.product_snapshot || {};
      return {
        id: review.reservations.id,
        storeId: review.reservations.store_id,
        storeName: review.reservations.stores.name,
        storeAddress: review.reservations.stores.address,
        storePhone: review.reservations.stores.phone,
        userId: review.reservations.user_id,
        customerName: review.reservations.customer_name,
        customerPhone: review.reservations.customer_phone,
        date: review.reservations.reservation_date,
        time: review.reservations.reservation_time,
        model: productSnapshot.model || '',
        storage: productSnapshot.storage || '',
        productCarrier: productSnapshot.carrier || '',
        price: productSnapshot.price || 0,
        status: review.reservations.status,
        createdAt: review.reservations.created_at,
        conditions: productSnapshot.conditions || [],
        review: {
          id: review.id,
          reservationId: review.reservation_id,
          rating: review.rating,
          content: review.content,
          createdAt: review.created_at
        }
      };
    }) || [];

    const totalCount = count || 0;
    const hasMore = (from + limit) < totalCount;

    return NextResponse.json({
      items: transformedData,
      totalCount,
      page,
      limit,
      hasMore
    });

  } catch (error) {
    console.error('판매자 리뷰 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
