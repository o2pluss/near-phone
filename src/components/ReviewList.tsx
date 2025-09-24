import React, { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { InfiniteScroll } from "./ui/infinite-scroll";
import { Star, User, ThumbsUp, MessageSquare, Filter } from "lucide-react";
import type { ReviewWithUser, ReviewStats } from "../types/review";
import { maskUserName } from "../utils/privacy";

interface ReviewListProps {
  storeId: string;
  reviews: ReviewWithUser[];
  reviewStats: ReviewStats;
  currentUserId?: string;
  showWriteButton?: boolean;
  onWriteReview?: () => void;
  // 서버 페이지네이션 props
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  loading?: boolean;
  // 디스플레이 옵션
  initialDisplayCount?: number;
  loadMoreCount?: number;
  enableInfiniteScroll?: boolean;
}

export default function ReviewList({ 
  storeId, 
  reviews, 
  reviewStats,
  currentUserId,
  showWriteButton = false,
  onWriteReview,
  hasMore = false,
  onLoadMore,
  loading = false,
  initialDisplayCount = 3,
  loadMoreCount = 15, // 서버 페이지 크기에 맞춤
  enableInfiniteScroll = false
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // 정렬된 리뷰 목록
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // 정렬 변경 핸들러 
  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    // 정렬 변경 시 서버에서 새로 데이터를 가져와야 할 수도 있음
    // 실제 구현에서는 onSortChange 콜백으로 처리
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  };

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${starSize} ${
          index < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateRatingPercentage = (count: number) => {
    return reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
  };

  // 리뷰 아이템 렌더링 함수
  const renderReviewItem = (review: ReviewWithUser, index: number) => {
    // 사용자는 자신의 리뷰는 전체 이름을 보고, 다른 사용자 리뷰는 마스킹된 이름을 봄
    const displayName = review.userId === currentUserId 
      ? maskUserName(review.userName, 'admin') // 자신의 리뷰는 전체 이름
      : maskUserName(review.userName, 'user'); // 다른 사용자 리뷰는 마스킹

    return (
      <div 
        className={`border rounded-lg p-4 ${
          review.userId === currentUserId ? 'bg-blue-50 border-blue-200' : 'bg-card'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{displayName}</span>
              {review.userId === currentUserId && (
                <Badge variant="secondary" className="text-xs">
                  내 리뷰
                </Badge>
              )}
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
      </div>
    );
  };

  if (reviewStats.totalReviews === 0) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">리뷰</h3>
          </div>
          {showWriteButton && onWriteReview && (
            <Button onClick={onWriteReview} size="sm">
              리뷰 작성
            </Button>
          )}
        </div>
        
        {/* 빈 상태 */}
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">아직 리뷰가 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            첫 번째 리뷰를 작성해보세요!
          </p>
          {showWriteButton && onWriteReview && (
            <Button onClick={onWriteReview}>
              리뷰 작성하기
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">리뷰 ({reviewStats.totalReviews})</h3>
        </div>
        {showWriteButton && onWriteReview && (
          <Button onClick={onWriteReview} size="sm">
            리뷰 작성
          </Button>
        )}
      </div>

      {/* 리뷰 요약 */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getRatingColor(reviewStats.averageRating)}`}>
              {reviewStats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-1">
              {renderStars(Math.round(reviewStats.averageRating), "md")}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {reviewStats.totalReviews}개 리뷰
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm w-2">{rating}</span>
                <Star className="h-3 w-3 fill-gray-300 text-gray-300" />
                <Progress 
                  value={calculateRatingPercentage(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution])} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-muted-foreground w-6">
                  {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">고객 리뷰</h3>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
            <SelectItem value="highest">높은별점순</SelectItem>
            <SelectItem value="lowest">낮은별점순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 리뷰 목록 - InfiniteScroll 컴포넌트 사용 */}
      <InfiniteScroll
        items={sortedReviews}
        hasMore={hasMore}
        onLoadMore={onLoadMore || (() => Promise.resolve())}
        loading={loading}
        renderItem={renderReviewItem}
        getItemKey={(review) => review.id}
        initialDisplayCount={initialDisplayCount}
        loadMoreCount={loadMoreCount}
        enableInfiniteScroll={enableInfiniteScroll}
        loadMoreText="리뷰 더보기"
        loadingText="리뷰를 불러오는 중..."
        noMoreText="모든 리뷰를 확인했습니다"
        showProgressIndicator={true}
      />
    </div>
  );
}