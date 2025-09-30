import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

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
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create reservation');
      return res.json();
    },
  });
}

export function useFavorite(storeId: string, userId: string) {
  const add = async () => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, store_id: storeId }),
    });
    if (!res.ok) throw new Error('Failed to add favorite');
    return res.json();
  };
  const remove = async () => {
    const sp = new URLSearchParams({ userId, storeId });
    const res = await fetch(`/api/favorites?${sp.toString()}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove favorite');
    return res.json();
  };
  return { add, remove };
}


