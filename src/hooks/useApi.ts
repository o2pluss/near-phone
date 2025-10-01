import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function useStores(
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['stores', params],
    queryFn: async ({ pageParam }) => {
      // undefined 값 필터링
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const sp = new URLSearchParams(filteredParams);
      if (pageParam) sp.set('cursor', String(pageParam));
      const res = await fetch(`/api/stores?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch stores');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useStoreProducts(
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['store-products', params],
    queryFn: async ({ pageParam }) => {
      // undefined 값 필터링
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const sp = new URLSearchParams(filteredParams);
      if (pageParam) sp.set('cursor', String(pageParam));
      const res = await fetch(`/api/store-products?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch store products');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useProducts(
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams();
      if (pageParam) sp.set('cursor', String(pageParam));
      const res = await fetch(`/api/products?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useDeviceModels(
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) {
  return useQuery<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ['device-models', params],
    queryFn: async () => {
      // undefined 값 필터링
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const sp = new URLSearchParams(filteredParams);
      const res = await fetch(`/api/device-models?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch device models');
      return res.json();
    },
    enabled: options?.enabled ?? true,
  });
}

export function useStoreSearch(
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['store-search', params],
    queryFn: async ({ pageParam }) => {
      // undefined 값 필터링
      const filteredParams = Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const sp = new URLSearchParams(filteredParams);
      if (pageParam) sp.set('cursor', String(pageParam));
      const res = await fetch(`/api/store-search?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch store search results');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useStore(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await fetch(`/api/stores?id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch store');
      return res.json();
    },
    enabled: options?.enabled ?? true,
  });
}

export function useReviews(
  params?: Record<string, string | number | undefined>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: ['reviews', params],
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams({ ...(params as any) });
      if (pageParam) sp.set('cursor', String(pageParam));
      const res = await fetch(`/api/reviews?${sp.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: async (payload: any) => {
      // 인증 헤더 가져오기
      const { getAuthHeaders } = await import('@/lib/auth');
      const authHeaders = await getAuthHeaders();
      
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        
        // 인증 오류 처리
        if (res.status === 401) {
          throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        }
        
        throw new Error(errorData.message || 'Failed to create reservation');
      }
      return res.json();
    },
  });
}

// 즐겨찾기 매장 목록 조회
export function useFavoriteStores(
  userId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['favorite-stores', userId],
    queryFn: async () => {
      // Supabase 클라이언트에서 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/favorites?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch favorite stores');
      return res.json();
    },
    enabled: options?.enabled ?? true,
  });
}

// 즐겨찾기 추가/제거
export function useFavoriteMutations(userId: string) {
  const addFavorite = useMutation({
    mutationFn: async ({ storeId, productId, productSnapshot }: { 
      storeId: string; 
      productId?: string; 
      productSnapshot?: any; 
    }) => {
      // Supabase 클라이언트에서 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ 
          user_id: userId, 
          store_id: storeId,
          product_id: productId,
          product_snapshot: productSnapshot
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('즐겨찾기 추가 오류:', errorData);
        throw new Error(`Failed to add favorite: ${errorData.error || res.statusText}`);
      }
      return res.json();
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (storeId: string) => {
      // Supabase 클라이언트에서 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/favorites?user_id=${userId}&store_id=${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to remove favorite');
      return res.json();
    },
  });

  return { addFavorite, removeFavorite };
}

// 특정 매장의 즐겨찾기 상태 확인
export function useFavoriteStatus(
  storeId: string,
  userId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['favorite-status', storeId, userId],
    queryFn: async () => {
      // Supabase 클라이언트에서 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/favorites/status?user_id=${userId}&store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch favorite status');
      return res.json();
    },
    enabled: options?.enabled ?? true,
  });
}


