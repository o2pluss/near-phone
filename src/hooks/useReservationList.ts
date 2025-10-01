import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReservationListParams {
  storeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

// 예약 목록 조회 (페이지네이션 지원)
export const useReservationList = (params: ReservationListParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['reservations', {
      storeId: params.storeId,
      status: params.status,
      startDate: params.startDate || null,
      endDate: params.endDate || null,
      search: params.search,
      limit: params.limit
    }],
    queryFn: async ({ pageParam }) => {
      // 인증 헤더 가져오기
      const { getAuthHeaders } = await import('@/lib/auth');
      const authHeaders = await getAuthHeaders();
      
      const searchParams = new URLSearchParams();
      
      // userId는 더 이상 필요하지 않음 (서버에서 인증된 사용자 ID 사용)
      if (params.storeId) searchParams.append('storeId', params.storeId);
      if (params.status) searchParams.append('status', params.status);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.search) searchParams.append('search', params.search);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (pageParam) searchParams.append('cursor', pageParam);
      
      const response = await fetch(`/api/reservations?${searchParams.toString()}`, {
        headers: authHeaders
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '예약 목록을 불러올 수 없습니다.');
      }
      const data = await response.json();
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 예약 상태 업데이트
export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reservationId, 
      status 
    }: { 
      reservationId: string; 
      status: string; 
    }) => {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('예약 상태 업데이트에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // 예약 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// 예약 취소
export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) {
        throw new Error('예약 취소에 실패했습니다.');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// 예약 상세 조회
export const useReservationDetail = (reservationId: string) => {
  return useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async () => {
      const response = await fetch(`/api/reservations/${reservationId}`);
      if (!response.ok) {
        throw new Error('예약 상세 정보를 불러올 수 없습니다.');
      }
      return response.json();
    },
    enabled: !!reservationId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
