import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  rating: number;
  reviewCount: number;
  model: string;
  price: number;
  conditions: string[];
  hours: string;
  position?: { x: number; y: number };
}

interface SearchParams {
  carrier?: string;
  model?: string;
  storage?: string;
  location?: string;
  distance?: number;
  minPrice?: number;
  maxPrice?: number;
  conditions?: string[];
}

// Mock API functions - Replace with actual Supabase calls
const fetchStores = async (params: SearchParams): Promise<Store[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data - In real app, this would be a Supabase query
  const mockStores: Store[] = [
    {
      id: '1',
      name: '강남 휴대폰 매장',
      address: '서울시 강남구 역삼동 123-45',
      distance: 0.3,
      phone: '02-1234-5678',
      rating: 4.8,
      reviewCount: 124,
      model: 'iPhone 15 Pro',
      price: 1200000,
      conditions: ['번호이동', '카드할인'],
      hours: '09:00 - 21:00',
      position: { x: 45, y: 30 }
    },
    {
      id: '2',
      name: '서초 모바일 센터',
      address: '서울시 서초구 서초동 456-78',
      distance: 0.8,
      phone: '02-2345-6789',
      rating: 4.5,
      reviewCount: 89,
      model: 'iPhone 15 Pro',
      price: 1150000,
      conditions: ['신규가입', '결합할인'],
      hours: '10:00 - 20:00',
      position: { x: 60, y: 55 }
    },
    {
      id: '3',
      name: '논현 통신',
      address: '서울시 강남구 논현동 789-12',
      distance: 1.2,
      phone: '02-3456-7890',
      rating: 4.6,
      reviewCount: 67,
      model: 'iPhone 15 Pro',
      price: 1180000,
      conditions: ['번호이동', '알뜰폰'],
      hours: '09:30 - 20:30',
      position: { x: 30, y: 70 }
    }
  ];

  // Apply filters
  let filteredStores = mockStores;
  
  if (params.carrier) {
    // Filter by carrier (mock implementation)
    filteredStores = filteredStores.filter(store => true); // All stores support all carriers in mock
  }
  
  if (params.model) {
    filteredStores = filteredStores.filter(store => 
      store.model.toLowerCase().includes(params.model!.toLowerCase())
    );
  }
  
  if (params.minPrice) {
    filteredStores = filteredStores.filter(store => store.price >= params.minPrice!);
  }
  
  if (params.maxPrice) {
    filteredStores = filteredStores.filter(store => store.price <= params.maxPrice!);
  }
  
  if (params.distance) {
    filteredStores = filteredStores.filter(store => store.distance <= params.distance!);
  }

  return filteredStores;
};

const fetchStoreById = async (storeId: string): Promise<Store | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const stores = await fetchStores({});
  return stores.find(store => store.id === storeId) || null;
};

// React Query hooks
export const useStores = (params: SearchParams) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => fetchStores(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};

export const useStore = (storeId: string) => {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => fetchStoreById(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchStores = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fetchStores,
    onSuccess: (data, variables) => {
      // Update the cache with the new search results
      queryClient.setQueryData(['stores', variables], data);
    },
  });
};