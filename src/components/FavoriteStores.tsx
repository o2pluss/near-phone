import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  X,
  Smartphone,
  User,
} from "lucide-react";
import { getConditionStyle } from "../lib/conditionStyles";
import { StoreConditionChips } from "./StoreConditionChips";
import { getFavoriteProductDisplay, getDeletedProductStyles } from "../utils/productDisplay";
import { ProductStatusBadge } from "./ui/ProductStatusBadge";

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
  // 상품별 통신사 정보
  productCarrier: "kt" | "skt" | "lgu";
  // 용량 정보
  storage: string;
  // 상품 스냅샷 (즐겨찾기 당시 정보 보존)
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

interface FavoriteStoresProps {
  onStoreSelect: (store: Store) => void;
}

const mockFavoriteStores: Store[] = [
  {
    id: "2",
    name: "서초 모바일 센터",
    address: "서울시 서초구 서초동 456-78",
    distance: 0.8,
    phone: "02-2345-6789",
    rating: 4.5,
    reviewCount: 89,
    model: "iPhone 15 Pro",
    price: 1150000,
    conditions: ["신규가입", "결합할인"],
    hours: "10:00 - 20:00",
    addedDate: "2024-01-15",
    productCarrier: "kt",
    storage: "128GB",
    productSnapshot: {
      id: "prod-2",
      name: "iPhone 15 Pro",
      model: "iPhone 15 Pro",
      storage: "128GB",
      price: 1150000,
      carrier: "kt",
      conditions: ["신규가입", "결합할인"],
      isDeleted: false
    }
  },
  {
    id: "5",
    name: "신논현 모바일샵",
    address: "서울시 강남구 신논현동 246-80",
    distance: 2.1,
    phone: "02-5678-9012",
    rating: 4.7,
    reviewCount: 203,
    model: "iPhone 15 Pro",
    price: 1170000,
    conditions: ["신규가입", "카드할인"],
    hours: "10:00 - 21:00",
    addedDate: "2024-01-10",
    productCarrier: "skt",
    storage: "256GB",
    productSnapshot: {
      id: "prod-5",
      name: "iPhone 15 Pro",
      model: "iPhone 15 Pro",
      storage: "256GB",
      price: 1170000,
      carrier: "skt",
      conditions: ["신규가입", "카드할인"],
      isDeleted: false
    }
  },
  {
    id: "7",
    name: "청담 스마트 스토어",
    address: "서울시 강남구 청담동 135-79",
    distance: 1.8,
    phone: "02-6789-0123",
    rating: 4.9,
    reviewCount: 178,
    model: "Galaxy S24 Ultra",
    price: 980000,
    conditions: ["번호이동", "기기변경", "당일개통"],
    hours: "09:00 - 21:00",
    addedDate: "2024-01-08",
    productCarrier: "lgu",
    storage: "512GB",
    productSnapshot: {
      id: "prod-7",
      name: "Galaxy S24 Ultra",
      model: "Galaxy S24 Ultra",
      storage: "512GB",
      price: 980000,
      carrier: "lgu",
      conditions: ["번호이동", "기기변경", "당일개통"],
      isDeleted: true, // 삭제된 상품 예시
      deletedAt: "2024-01-20T15:30:00"
    }
  },
];

export default function FavoriteStores({
  onStoreSelect,
}: FavoriteStoresProps) {
  const [favoriteStores, setFavoriteStores] = useState<Store[]>(
    mockFavoriteStores,
  );

  const removeFavorite = (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteStores(
      favoriteStores.filter((store) => store.id !== storeId),
    );
  };

  const handleStoreClick = (store: Store, e: React.MouseEvent) => {
    // 버튼 클릭 시에는 카드 클릭 이벤트 무시
    if (
      e.target !== e.currentTarget &&
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    
    // 삭제된 상품인 경우 예약 불가능 - 클릭 무시
    const productDisplay = getFavoriteProductDisplay(store);
    if (productDisplay.isDeleted) {
      return;
    }
    
    onStoreSelect(store);
  };

  if (favoriteStores.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              즐겨찾기한 매장이 없습니다
            </h2>
            <p className="text-muted-foreground mb-6">
              관심 있는 매장을 즐겨찾기에 추가해보세요
            </p>
            <Button variant="outline">매장 찾기</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>즐겨찾기</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                {favoriteStores.length}개
              </p>
            </div>
          </div>

          {/* Favorite Stores List */}
          <div className="space-y-0">
            {favoriteStores.map((store, index) => {
              const productDisplay = getFavoriteProductDisplay(store);
              const isDisabled = productDisplay.isDeleted;
              const deletedStyles = getDeletedProductStyles();
              
              return (
                <div key={store.id} className="relative">
                  <div
                    className={`${
                      isDisabled 
                        ? 'cursor-not-allowed bg-gray-100 opacity-70' 
                        : 'cursor-pointer hover:bg-gray-50'
                    } rounded-lg p-3 transition-colors ${
                      index < favoriteStores.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                    onClick={(e) => handleStoreClick(store, e)}
                  >
                    {/* Store Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-base">{store.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 fill-gray-300 text-gray-300" />
                          <span className="text-sm font-medium">
                            {store.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({store.reviewCount})
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          • {store.distance}km
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                        onClick={(e) => removeFavorite(store.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Product & Price Info with Deletion Handling */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-sm ${productDisplay.isDeleted ? deletedStyles.textColor : 'text-muted-foreground'}`}>
                        {productDisplay.carrier.toUpperCase()} {productDisplay.model} {productDisplay.storage}
                      </div>
                      <span className={`font-semibold text-lg ${productDisplay.isDeleted ? deletedStyles.textColor : ''}`}>
                        {productDisplay.price.toLocaleString()}원
                      </span>
                    </div>

                    {/* Deletion Warning */}
                    {productDisplay.deletionMessage && (
                      <div className="mb-2">
                        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                          ⚠️ {productDisplay.deletionMessage}
                        </p>
                      </div>
                    )}

                    {/* Conditions */}
                    <StoreConditionChips 
                      productCarrier={store.productCarrier}
                      conditions={store.conditions}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}