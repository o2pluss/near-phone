import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

import { Review } from '../types/review';

// Types
interface Reservation {
  id: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancel_pending';
  createdAt: string;
  conditions: string[];
  review?: Review; // 종료된 예약에 리뷰가 있을 수 있음
}

interface CreateReservationData {
  storeId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  model: string;
  price: number;
}

// Mock API functions - Replace with actual Supabase calls
const fetchUserReservations = async (userId: string): Promise<Reservation[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data
  const mockReservations: Reservation[] = [
    {
      id: '1',
      storeId: '1',
      storeName: '강남 휴대폰 매장',
      storeAddress: '서울시 강남구 역삼동 123-45',
      storePhone: '02-1234-5678',
      userId: userId,
      customerName: '김고객',
      customerPhone: '010-1234-5678',
      date: '2024-01-20',
      time: '14:30',
      model: 'iPhone 15 Pro',
      price: 1200000,
      status: 'confirmed',
      createdAt: '2024-01-18T10:30:00',
      conditions: ['번호이동', '카드할인']
    },
    {
      id: '2',
      storeId: '2',
      storeName: '서초 모바일 센터',
      storeAddress: '서울시 서초구 서초동 456-78',
      storePhone: '02-2345-6789',
      userId: userId,
      customerName: '김고객',
      customerPhone: '010-1234-5678',
      date: '2024-01-22',
      time: '11:00',
      model: 'Galaxy S24 Ultra',
      price: 980000,
      status: 'pending',
      createdAt: '2024-01-19T15:20:00',
      conditions: ['신규가입', '결합할인']
    }
  ];
  
  return mockReservations;
};

const fetchStoreReservations = async (storeId: string): Promise<Reservation[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data for store owner
  const mockReservations: Reservation[] = [
    {
      id: '1',
      storeId: storeId,
      storeName: '강남 휴대폰 매장',
      storeAddress: '서울시 강남구 역삼동 123-45',
      storePhone: '02-1234-5678',
      userId: 'user1',
      customerName: '김고객',
      customerPhone: '010-1234-5678',
      date: '2024-01-20',
      time: '14:30',
      model: 'iPhone 15 Pro',
      price: 1200000,
      status: 'pending',
      createdAt: '2024-01-18T10:30:00',
      conditions: ['번호이동', '카드할인']
    },
    {
      id: '2',
      storeId: storeId,
      storeName: '강남 휴대폰 매장',
      storeAddress: '서울시 강남구 역삼동 123-45',
      storePhone: '02-1234-5678',
      userId: 'user2',
      customerName: '이사용',
      customerPhone: '010-2345-6789',
      date: '2024-01-21',
      time: '11:00',
      model: 'Galaxy S24 Ultra',
      price: 980000,
      status: 'confirmed',
      createdAt: '2024-01-19T15:20:00',
      conditions: ['신규가입', '결합할인']
    }
  ];
  
  return mockReservations;
};

const createReservation = async (data: CreateReservationData): Promise<Reservation> => {
  // 인증 헤더 가져오기
  const { getAuthHeaders } = await import('@/lib/auth');
  const authHeaders = await getAuthHeaders();
  
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      store_id: data.storeId,
      product_id: null, // 유효한 UUID가 없으면 null
      store_product_id: null, // 유효한 UUID가 없으면 null
      reservation_date: data.date,
      reservation_time: data.time,
      customer_name: data.name,
      customer_phone: data.phone,
      memo: '',
      product_snapshot: {
        model: data.model,
        price: data.price,
        conditions: ['번호이동', '카드할인']
      }
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    
    // 인증 오류 처리
    if (response.status === 401) {
      throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
    }
    
    throw new Error(errorData.message || 'Failed to create reservation');
  }
  
  const newReservation = await response.json();
  
  // API 응답을 Reservation 타입으로 변환
  return {
    id: newReservation.id,
    storeId: newReservation.store_id,
    storeName: newReservation.stores?.name || '알 수 없는 매장',
    storeAddress: newReservation.stores?.address || '',
    storePhone: newReservation.stores?.phone || '',
    userId: newReservation.user_id,
    customerName: newReservation.customer_name,
    customerPhone: newReservation.customer_phone,
    date: newReservation.reservation_date,
    time: newReservation.reservation_time,
    model: data.model,
    price: data.price,
    status: newReservation.status,
    createdAt: newReservation.created_at,
    conditions: ['번호이동', '카드할인']
  };
};

const updateReservationStatus = async (reservationId: string, status: Reservation['status']): Promise<Reservation> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock update - in real app, this would update Supabase
  const mockUpdatedReservation: Reservation = {
    id: reservationId,
    storeId: '1',
    storeName: '강남 휴대폰 매장',
    storeAddress: '서울시 강남구 역삼동 123-45',
    storePhone: '02-1234-5678',
    userId: 'user1',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    date: '2024-01-20',
    time: '14:30',
    model: 'iPhone 15 Pro',
    price: 1200000,
    status: status,
    createdAt: '2024-01-18T10:30:00',
    conditions: ['번호이동', '카드할인']
  };
  
  return mockUpdatedReservation;
};

// React Query hooks
export const useUserReservations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reservations', 'user', user?.id],
    queryFn: () => fetchUserReservations(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStoreReservations = (storeId: string) => {
  return useQuery({
    queryKey: ['reservations', 'store', storeId],
    queryFn: () => fetchStoreReservations(storeId),
    enabled: !!storeId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: createReservation,
    onSuccess: (newReservation) => {
      // Update user reservations cache
      queryClient.setQueryData(
        ['reservations', 'user', user?.id],
        (oldData: Reservation[] | undefined) => {
          return oldData ? [...oldData, newReservation] : [newReservation];
        }
      );
      
      // Update store reservations cache
      queryClient.setQueryData(
        ['reservations', 'store', newReservation.storeId],
        (oldData: Reservation[] | undefined) => {
          return oldData ? [...oldData, newReservation] : [newReservation];
        }
      );
    },
  });
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reservationId, status }: { reservationId: string; status: Reservation['status'] }) =>
      updateReservationStatus(reservationId, status),
    onSuccess: (updatedReservation) => {
      // Invalidate and refetch reservations
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};