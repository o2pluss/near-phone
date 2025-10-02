import { useQuery } from '@tanstack/react-query';
import { getSellerReviews, getReviewStats } from '@/lib/api/reviews';
import { SellerReviewSearchParams, SellerReviewSearchResult, ReviewStats } from '@/lib/api/reviews';

// 판매자 리뷰 목록 조회 훅
export const useSellerReviews = (params: SellerReviewSearchParams) => {
  return useQuery<SellerReviewSearchResult>({
    queryKey: ['sellerReviews', params],
    queryFn: () => getSellerReviews(params),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};

// 리뷰 통계 조회 훅
export const useReviewStats = (storeId: string) => {
  return useQuery({
    queryKey: ['reviewStats', storeId],
    queryFn: () => getReviewStats(storeId),
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 30 * 60 * 1000, // 30분
    enabled: !!storeId,
  });
};
