import { NextRequest, NextResponse } from 'next/server';
import { mockDataStore } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? '15');
  
  // 검색/필터 파라미터
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const searchQuery = searchParams.get('search') ? decodeURIComponent(searchParams.get('search')!) : null;

  // Mock 데이터 반환
  let allReservations = mockDataStore.getReservations();
  
  // 사용자 필터
  if (userId) {
    allReservations = allReservations.filter(reservation => reservation.user_id === userId);
  }
  
  // 매장 필터
  if (storeId) {
    allReservations = allReservations.filter(reservation => reservation.store_id === storeId);
  }
  
  // 상태 필터 (여러 상태 지원: "confirmed,completed")
  if (status && status !== 'all') {
    const statusList = status.split(',').map(s => s.trim());
    allReservations = allReservations.filter(reservation => statusList.includes(reservation.status));
  }
  
  // 날짜 필터 (예약 날짜 기준)
  if (startDate) {
    allReservations = allReservations.filter(reservation => reservation.reservation_date >= startDate);
  }
  if (endDate) {
    allReservations = allReservations.filter(reservation => reservation.reservation_date <= endDate);
  }
  
  // 검색 필터
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    allReservations = allReservations.filter(reservation => {
      const customerName = reservation.customer_name || '';
      const customerPhone = reservation.customer_phone || '';
      const productModel = reservation.product_snapshot?.model || '';
      const storeName = reservation.store_snapshot?.name || '';
      
      return customerName.toLowerCase().includes(query) ||
             customerPhone.includes(query) ||
             productModel.toLowerCase().includes(query) ||
             storeName.toLowerCase().includes(query);
    });
  }
  
  // 정렬 (최신순)
  allReservations = allReservations.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // 페이지네이션 (cursor 기반)
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = allReservations.findIndex(reservation => reservation.created_at === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  
  const data = allReservations.slice(startIndex, startIndex + limit);
  const nextCursor = data.length === limit ? data[data.length - 1].created_at : null;
  
  return NextResponse.json({ items: data, nextCursor });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // 중복 예약 체크
  const existingReservations = mockDataStore.getReservations();
  const duplicateReservation = existingReservations.find(reservation => 
    reservation.store_id === body.store_id &&
    reservation.reservation_date === body.reservation_date &&
    reservation.reservation_time === body.reservation_time &&
    (reservation.status === 'pending' || reservation.status === 'confirmed')
  );
  
  if (duplicateReservation) {
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
  
  // Mock 데이터 생성 및 저장
  const newReservation = mockDataStore.addReservation(body);
  
  return NextResponse.json(newReservation, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  // 모든 예약 데이터 삭제
  mockDataStore.clearAllReservations();
  
  return NextResponse.json({ message: '모든 예약 데이터가 삭제되었습니다.' });
}


