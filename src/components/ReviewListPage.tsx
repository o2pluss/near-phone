import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { InfiniteScroll } from './ui/infinite-scroll';
import { Badge } from './ui/badge';
import { Star, User, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import type { ReviewWithUser } from '../types/review';

interface ReviewListPageProps {
  storeId?: string;
  storeName?: string;
  onBack?: () => void;
}

// Mock API 함수
const fetchReviews = async (page: number, storeId?: string): Promise<{
  reviews: ReviewWithUser[];
  hasMore: boolean;
  totalCount: number;
}> => {
  // 실제로는 서버 API 호출
  await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
  
  // Mock 데이터 생성 (실제로는 서버에서 받아옴)
  const pageSize = 15;
  const startIndex = (page - 1) * pageSize;
  
  const allReviews: ReviewWithUser[] = Array.from({ length: 47 }, (_, i) => ({
    id: `review-${i + 1}`,
    storeId: storeId || "1",
    storeName: "강남 모바일센터",
    userId: `user-${i + 1}`,
    userName: `고객${i + 1}`,
    userPhone: "010-****-****",
    reservationId: `res-${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    content: [
      "정말 친절하게 설명해주시고 가격도 합리적이었습니다. 추천합니다!",
      "매장이 깨끗하고 직원분이 전문적이었어요. 다만 대기시간이 조금 길었습니다.",
      "할인 혜택도 많고 AS 서비스도 좋네요. 만족합니다!",
      "보통입니다. 가격은 괜찮았는데 서비스가 아쉬웠어요.",
      "빠른 처리와 친절한 서비스가 인상적이었습니다. 강력 추천!",
      "예약부터 구매까지 모든 과정이 매끄러웠어요. 다시 이용하고 싶습니다.",
      "대기시간이 너무 길었고, 원하는 색상이 없어서 아쉬웠습니다."
    ][i % 7],
    model: ["iPhone 15 Pro", "Galaxy S24 Ultra", "iPhone 15", "Galaxy S24", "iPhone 15 Pro Max"][i % 5],
    price: [1200000, 980000, 950000, 850000, 1400000][i % 5],
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  const pageReviews = allReviews.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < allReviews.length;
  
  return {
    reviews: pageReviews,
    hasMore,
    totalCount: allReviews.length
  };
};

export default function ReviewListPage({ storeId, storeName, onBack }: ReviewListPageProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialReviews();
  }, [storeId]);

  const loadInitialReviews = async () => {
    setLoading(true);
    try {
      const result = await fetchReviews(1, storeId);
      setReviews(result.reviews);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setPage(1);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchReviews(page + 1, storeId);
      setReviews(prev => [...prev, ...result.reviews]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderReviewItem = (review: ReviewWithUser, index: number) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{review.userName}</span>
              <Badge variant="outline" className="text-xs">
                {review.storeName}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-sm text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-foreground leading-relaxed">
          {review.content}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-6">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {storeName ? `${storeName} 리뷰` : '전체 리뷰'}
            </h1>
            <p className="text-muted-foreground">
              총 {totalCount}개의 리뷰
            </p>
          </div>
        </div>

        {/* 리뷰 목록 */}
        <InfiniteScroll
          items={reviews}
          hasMore={hasMore}
          onLoadMore={loadMoreReviews}
          loading={loading}
          renderItem={renderReviewItem}
          getItemKey={(review) => review.id}
          initialDisplayCount={15} // 서버 페이지 크기
          loadMoreCount={15} // 서버 페이지 크기
          enableInfiniteScroll={true} // 전체 리뷰 페이지에서는 무한 스크롤 사용
          loadMoreText="리뷰 더보기"
          loadingText="리뷰를 불러오는 중..."
          noMoreText="모든 리뷰를 확인했습니다"
          showProgressIndicator={true}
          containerClassName="space-y-4"
        />
      </div>
    </div>
  );
}