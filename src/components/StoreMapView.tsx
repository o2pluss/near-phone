import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Star, Phone, Clock, Navigation } from 'lucide-react';
import { formatPrice, formatPriceForMap } from '../utils/formatPrice';

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  rating: number;
  model: string;
  price: number;
  conditions: string[];
  hours: string;
  position: { x: number; y: number };
}

interface StoreMapViewProps {
  onStoreSelect: (store: Store) => void;
}

const mockStores: Store[] = [
  {
    id: '1',
    name: '강남 휴대폰 매장',
    address: '서울시 강남구 역삼동 123-45',
    distance: 0.3,
    phone: '02-1234-5678',
    rating: 4.8,
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
    model: 'iPhone 15 Pro',
    price: 1180000,
    conditions: ['번호이동', '알뜰폰'],
    hours: '09:30 - 20:30',
    position: { x: 30, y: 70 }
  }
];

export default function StoreMapView({ onStoreSelect }: StoreMapViewProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
  };

  const handleStoreCardClick = () => {
    if (selectedStore) {
      onStoreSelect(selectedStore);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Map Area */}
      <div className="flex-1 relative bg-slate-100 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
          {/* Mock Streets */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-1 bg-gray-300"></div>
        </div>

        {/* Store Pins */}
        {mockStores.map((store) => (
          <div
            key={store.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{
              left: `${store.position.x}%`,
              top: `${store.position.y}%`
            }}
            onClick={() => handleStoreClick(store)}
          >
            <div className="relative">
              <div className={`
                flex flex-col items-center space-y-1 transition-transform
                ${selectedStore?.id === store.id ? 'scale-110' : 'hover:scale-105'}
              `}>
                {/* Price Badge */}
                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {formatPriceForMap(store.price)}
                </div>
                {/* Pin */}
                <div className={`
                  w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center
                  ${selectedStore?.id === store.id ? 'bg-red-600' : 'bg-red-500'}
                `}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Current Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button size="sm" variant="secondary" className="shadow-lg">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="shadow-lg">
            +
          </Button>
          <Button size="sm" variant="secondary" className="shadow-lg">
            -
          </Button>
        </div>
      </div>

      {/* Store Info Card (Bottom Sheet) */}
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
                        {selectedStore.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedStore.address} · {selectedStore.distance}km
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{selectedStore.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedStore.hours}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedStore.model}</span>
                      <span className="font-semibold text-lg text-red-600">
                        {formatPrice(selectedStore.price)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {selectedStore.conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStoreCardClick}
                  className="ml-4"
                >
                  상세보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Info */}
      <div className="bg-muted/50 p-2 text-center text-sm text-muted-foreground">
        {mockStores.length}개 매장 · 핀을 탭하여 매장 정보를 확인하세요
      </div>
    </div>
  );
}