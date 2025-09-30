import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Phone, Clock, X } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import NaverMapWithSearch from './NaverMapWithSearch';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  model?: string;
  price?: number;
  conditions?: string[];
  hours?: string;
}

interface StoreMapViewProps {
  onStoreSelect: (store: Store) => void;
}

export default function StoreMapView({ onStoreSelect }: StoreMapViewProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  // 매장 데이터 가져오기
  const { data: storesData, isLoading } = useQuery({
    queryKey: ['stores-for-map'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('매장 데이터 로드 실패:', error);
        return [];
      }

      return data.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        rating: store.rating || 0,
        reviewCount: store.review_count || 0,
        distance: 0, // 실제 거리 계산 로직 필요
        model: 'iPhone 15 Pro', // 실제 모델 정보 필요
        price: 1200000, // 실제 가격 정보 필요
        conditions: ['번호이동', '카드할인'], // 실제 조건 정보 필요
        hours: '09:00 - 21:00' // 실제 영업시간 정보 필요
      }));
    }
  });

  useEffect(() => {
    if (storesData) {
      setStores(storesData);
    }
  }, [storesData]);

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  const handleStoreCardClick = () => {
    if (selectedStore) {
      onStoreSelect(selectedStore);
    }
  };

  const handleCloseStoreInfo = () => {
    setSelectedStore(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">매장 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 네이버 지도 영역 */}
      <div className="flex-1">
        <NaverMapWithSearch
          stores={stores}
          onStoreSelect={handleStoreSelect}
          center={{ lat: 37.5665, lng: 126.9780 }}
          zoom={10}
          className="w-full h-full"
          showSearch={true}
        />
      </div>

      {/* 매장 정보 카드 (하단 시트) */}
      {selectedStore && (
        <div className="bg-white border-t shadow-lg">
          <Card className="border-0 rounded-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{selectedStore.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        {selectedStore.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({selectedStore.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedStore.address}
                    {selectedStore.distance && ` · ${selectedStore.distance}km`}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    {selectedStore.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{selectedStore.phone}</span>
                      </div>
                    )}
                    {selectedStore.hours && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedStore.hours}</span>
                      </div>
                    )}
                  </div>

                  {(selectedStore.model || selectedStore.price) && (
                    <div className="space-y-2">
                      {selectedStore.model && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedStore.model}</span>
                          {selectedStore.price && (
                            <span className="font-semibold text-lg text-red-600">
                              {formatPrice(selectedStore.price)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {selectedStore.conditions && selectedStore.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedStore.conditions.map((condition, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button 
                    onClick={handleStoreCardClick}
                    size="sm"
                  >
                    상세보기
                  </Button>
                  <Button 
                    onClick={handleCloseStoreInfo}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="bg-muted/50 p-2 text-center text-sm text-muted-foreground">
        {stores.length}개 매장 · 핀을 탭하여 매장 정보를 확인하세요
      </div>
    </div>
  );
}