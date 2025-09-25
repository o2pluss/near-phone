import { NextRequest, NextResponse } from 'next/server';
import { mockDataStore } from '@/lib/mockData';

// 예약 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reservation = mockDataStore.getReservationById(params.id);
  
  if (!reservation) {
    return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  }
  
  return NextResponse.json(reservation);
}

// 예약 상태 업데이트
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { status, cancellation_reason } = body;
  
  console.log('PATCH 요청:', { id: params.id, status, cancellation_reason });
  console.log('현재 저장된 예약들:', mockDataStore.getReservations().map(r => r.id));
  
  const updatedReservation = mockDataStore.updateReservation(params.id, {
    status,
    cancellation_reason
  });
  
  if (!updatedReservation) {
    console.log('예약을 찾을 수 없음:', params.id);
    return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  }
  
  console.log('예약 업데이트 성공:', updatedReservation);
  return NextResponse.json(updatedReservation);
}

// 예약 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = mockDataStore.deleteReservation(params.id);
  
  if (!success) {
    return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
  }
  
  return NextResponse.json({ message: '예약이 삭제되었습니다.' });
}
