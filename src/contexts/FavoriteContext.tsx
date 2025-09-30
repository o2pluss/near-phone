'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFavoriteStores, useFavoriteMutations } from '@/hooks/useApi';

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
  addedDate: string;
  productCarrier: "kt" | "skt" | "lgu";
  storage: string;
  productSnapshot?: {
    id: string;
    name: string;
    model: string;
    storage: string;
    price: number;
    carrier: string;
    conditions: string[];
    isDeleted: boolean;
    deletedAt?: string;
    deletionReason?: string;
  };
}

interface FavoriteContextType {
  favoriteStores: Store[];
  isLoading: boolean;
  isError: boolean;
  addToFavorites: (params: { storeId: string; productId?: string; productSnapshot?: any }) => Promise<void>;
  removeFromFavorites: (storeId: string) => Promise<void>;
  isFavorite: (storeId: string) => boolean;
  refreshFavorites: () => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

interface FavoriteProviderProps {
  children: React.ReactNode;
  userId: string;
}

export function FavoriteProvider({ children, userId }: FavoriteProviderProps) {
  const queryClient = useQueryClient();
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<Set<string>>(new Set());

  // 즐겨찾기 매장 목록 조회 (anonymous 사용자는 제외)
  const { data: favoriteStoresData, isLoading, isError, refetch } = useFavoriteStores(
    userId, 
    { enabled: userId !== 'anonymous' }
  );
  
  // 즐겨찾기 추가/제거 뮤테이션 (anonymous 사용자는 제외)
  const { addFavorite, removeFavorite } = useFavoriteMutations(
    userId !== 'anonymous' ? userId : ''
  );

  // 즐겨찾기 매장 ID 목록 업데이트
  useEffect(() => {
    if (favoriteStoresData?.data) {
      const storeIds = new Set(favoriteStoresData.data.map((store: any) => store.store_id || store.id));
      setFavoriteStoreIds(storeIds);
    }
  }, [favoriteStoresData]);

  // 즐겨찾기 추가
  const addToFavorites = async (params: { storeId: string; productId?: string; productSnapshot?: any }) => {
    if (userId === 'anonymous') {
      throw new Error('로그인이 필요합니다');
    }
    
    try {
      await addFavorite.mutateAsync(params);
      setFavoriteStoreIds(prev => new Set([...prev, params.storeId]));
      
      // 즐겨찾기 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['favorite-stores', userId] });
    } catch (error) {
      console.error('즐겨찾기 추가 실패:', error);
      throw error;
    }
  };

  // 즐겨찾기 제거
  const removeFromFavorites = async (storeId: string) => {
    if (userId === 'anonymous') {
      throw new Error('로그인이 필요합니다');
    }
    
    try {
      await removeFavorite.mutateAsync(storeId);
      setFavoriteStoreIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(storeId);
        return newSet;
      });
      
      // 즐겨찾기 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: ['favorite-stores', userId] });
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
      throw error;
    }
  };

  // 즐겨찾기 상태 확인
  const isFavorite = (storeId: string) => {
    return favoriteStoreIds.has(storeId);
  };

  // 즐겨찾기 목록 새로고침
  const refreshFavorites = () => {
    refetch();
  };

  const value: FavoriteContextType = {
    favoriteStores: favoriteStoresData?.data || [],
    isLoading,
    isError,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}
