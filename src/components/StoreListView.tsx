import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star, MapPin, Phone, Clock, Heart } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

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
  isFavorite: boolean;
}

interface StoreListViewProps {
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
    reviewCount: 124,
    model: 'iPhone 15 Pro',
    price: 1200000,
    conditions: ['번호이동', '카드할인'],
    hours: '09:00 - 21:00',
    isFavorite: false
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
    isFavorite: true
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
    isFavorite: false
  },
  {
    id: '4',
    name: '역삼 스마트폰 프라자',
    address: '서울시 강남구 역삼동 987-65',
    distance: 1.5,
    phone: '02-4567-8901',
    rating: 4.4,
    reviewCount: 156,
    model: 'iPhone 15 Pro',
    price: 1220000,
    conditions: ['번호이동', '카드할인', '결합할인'],
    hours: '09:00 - 20:00',
    isFavorite: false
  },
  {
    id: '5',
    name: '신논현 모바일샵',
    address: '서울시 강남구 신논현동 246-80',
    distance: 2.1,
    phone: '02-5678-9012',
    rating: 4.7,
    reviewCount: 203,
    model: 'iPhone 15 Pro',
    price: 1170000,
    conditions: ['신규가입', '카드할인'],
    hours: '10:00 - 21:00',
    isFavorite: true
  }
];

export default function StoreListView({ onStoreSelect }: StoreListViewProps) {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [sortBy, setSortBy] = useState<string>('distance');

  const toggleFavorite = (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStores(stores.map(store => 
      store.id === storeId 
        ? { ...store, isFavorite: !store.isFavorite }
        : store
    ));
  };

  const sortedStores = [...stores].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header with Sort Options */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">매장 목록</h2>
          <p className="text-sm text-muted-foreground">
            {stores.length}개 매장이 검색되었습니다
          </p>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">거리순</SelectItem>
            <SelectItem value="price">가격순</SelectItem>
            <SelectItem value="rating">평점순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Store List */}
      <div className="space-y-3">
        {sortedStores.map((store) => (
          <Card 
            key={store.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onStoreSelect(store)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Store Name and Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{store.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{store.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({store.reviewCount})
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => toggleFavorite(store.id, e)}
                      className="p-1"
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          store.isFavorite 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                  </div>

                  {/* Address and Distance */}
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{store.address}</span>
                    <span>·</span>
                    <span>{store.distance}km</span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{store.hours}</span>
                    </div>
                  </div>

                  {/* Model and Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{store.model}</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-600">
                        {formatPrice(store.price)}
                      </div>
                      {sortBy === 'price' && store === sortedStores[0] && (
                        <Badge variant="destructive" className="text-xs">
                          최저가
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="flex flex-wrap gap-1">
                    {store.conditions.map((condition, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center py-4">
        <Button variant="outline" className="w-full max-w-sm">
          더 많은 매장 보기
        </Button>
      </div>
    </div>
  );
}