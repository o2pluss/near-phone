import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 리뷰 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

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
    const { rating, content } = body;

    // 필수 필드 검증
    if (!rating || !content) {
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

    // 기존 리뷰 조회 및 권한 확인
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id, store_id, status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인의 리뷰인지 확인
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: '본인의 리뷰만 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 활성 상태인지 확인
    if (existingReview.status !== 'active') {
      return NextResponse.json(
        { error: '수정할 수 없는 리뷰입니다.' },
        { status: 400 }
      );
    }

    // 리뷰 수정
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        rating,
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select(`
        *,
        profiles!reviews_user_id_fkey (
          name,
          role
        )
      `)
      .single();

    if (updateError) {
      console.error('리뷰 수정 오류:', updateError);
      return NextResponse.json(
        { error: '리뷰 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 매장 평점 업데이트
    const { error: ratingUpdateError } = await supabase.rpc('update_store_rating', {
      store_id: existingReview.store_id
    });

    if (ratingUpdateError) {
      console.error('매장 평점 업데이트 오류:', ratingUpdateError);
    }

    // 응답 데이터 변환
    const responseData = {
      ...updatedReview,
      userName: updatedReview.profiles?.name || '익명'
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('리뷰 수정 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 삭제 (소프트 삭제)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

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

    // 기존 리뷰 조회 및 권한 확인
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id, store_id, status')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 본인의 리뷰인지 확인
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: '본인의 리뷰만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 이미 삭제된 리뷰인지 확인
    if (existingReview.status === 'deleted') {
      return NextResponse.json(
        { error: '이미 삭제된 리뷰입니다.' },
        { status: 400 }
      );
    }

    // 리뷰 소프트 삭제
    const { error: deleteError } = await supabase
      .from('reviews')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (deleteError) {
      console.error('리뷰 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '리뷰 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 매장 평점 업데이트
    const { error: ratingUpdateError } = await supabase.rpc('update_store_rating', {
      store_id: existingReview.store_id
    });

    if (ratingUpdateError) {
      console.error('매장 평점 업데이트 오류:', ratingUpdateError);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('리뷰 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
