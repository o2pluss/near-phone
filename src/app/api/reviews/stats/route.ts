import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 해당 매장의 리뷰 통계 조회
    const { data: stats, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('store_id', storeId)
      .eq('status', 'active');

    if (statsError) {
      console.error('리뷰 통계 조회 오류:', statsError);
      return NextResponse.json(
        { error: '리뷰 통계를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 통계 계산
    const totalReviews = stats.length;
    
    if (totalReviews === 0) {
      return NextResponse.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      });
    }

    // 평균 평점 계산
    const averageRating = stats.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    // 평점 분포 계산
    const ratingDistribution = {
      5: stats.filter(r => r.rating === 5).length,
      4: stats.filter(r => r.rating === 4).length,
      3: stats.filter(r => r.rating === 3).length,
      2: stats.filter(r => r.rating === 2).length,
      1: stats.filter(r => r.rating === 1).length
    };

    return NextResponse.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // 소수점 둘째 자리까지
      ratingDistribution
    });

  } catch (error) {
    console.error('리뷰 통계 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
