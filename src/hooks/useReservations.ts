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
  review?: Review; // 완료된 예약에 리뷰가 있을 수 있음
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
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock creating a reservation
  const newReservation: Reservation = {
    id: Date.now().toString(),
    storeId: data.storeId,
    storeName: '강남 휴대폰 매장', // This would come from store data
    storeAddress: '서울시 강남구 역삼동 123-45',
    storePhone: '02-1234-5678',
    userId: 'current-user-id',
    customerName: data.name,
    customerPhone: data.phone,
    date: data.date,
    time: data.time,
    model: data.model,
    price: data.price,
    status: 'pending',
    createdAt: new Date().toISOString(),
    conditions: ['번호이동', '카드할인']
  };
  
  return newReservation;
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