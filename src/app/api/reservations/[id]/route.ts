import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// 예약 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: reservation, error } = await supabaseServer
      .from('reservations')
      .select(`
        *,
        stores!inner(name, address, phone),
        products(name, model, brand)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('예약 조회 에러:', error);
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('예약 조회 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 예약 상태 업데이트
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, cancellation_reason } = body;
    
    console.log('PATCH 요청:', { id: params.id, status, cancellation_reason });
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
    }
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data: updatedReservation, error } = await supabaseServer
      .from('reservations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      console.error('예약 업데이트 에러:', error);
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    if (!updatedReservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    console.log('예약 업데이트 성공:', updatedReservation);
    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('예약 업데이트 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 예약 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseServer
      .from('reservations')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      console.error('예약 삭제 에러:', error);
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({ message: '예약이 삭제되었습니다.' });
  } catch (error) {
    console.error('예약 삭제 실패:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
