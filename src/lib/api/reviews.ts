import { ReservationWithReview, ReviewStats } from '@/types/review';

// 판매자용 리뷰 조회 파라미터
export interface SellerReviewSearchParams {
  storeId: string;
  userName?: string;
  startDate?: string;
  endDate?: string;
  rating?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}

// 판매자용 리뷰 조회 결과
export interface SellerReviewSearchResult {
  items: ReservationWithReview[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 판매자용 리뷰 목록 조회
export const getSellerReviews = async (params: SellerReviewSearchParams): Promise<SellerReviewSearchResult> => {
  try {
    const searchParams = new URLSearchParams();
    
    searchParams.append('storeId', params.storeId);
    if (params.userName) searchParams.append('userName', params.userName);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.rating) searchParams.append('rating', params.rating.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/seller/reviews?${searchParams.toString()}`);
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { error: `HTTP ${response.status} Error` };
      }
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('판매자 리뷰 목록 조회 실패:', error);
    throw error;
  }
};

// 리뷰 통계 조회
export const getReviewStats = async (storeId: string): Promise<ReviewStats> => {
  try {
    const response = await fetch(`/api/reviews/stats?storeId=${storeId}`);
    
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorData = { error: `HTTP ${response.status} Error` };
      }
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('리뷰 통계 조회 실패:', error);
    throw error;
  }
};

// 특정 리뷰 조회
export const getReviewById = async (reviewId: string): Promise<ReservationWithReview | null> => {
  try {
    const response = await fetch(`/api/reviews/${reviewId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
};
