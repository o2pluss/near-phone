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
import { useFavorites } from "../contexts/FavoriteContext";

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

export default function FavoriteStores({
  onStoreSelect,
}: FavoriteStoresProps) {
  const { favoriteStores, isLoading, isError, removeFromFavorites } = useFavorites();

  const removeFavorite = async (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFromFavorites(storeId);
    } catch (error) {
      console.error('즐겨찾기 제거 실패:', error);
    }
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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">즐겨찾기 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              즐겨찾기 목록을 불러올 수 없습니다
            </h2>
            <p className="text-muted-foreground mb-6">
              잠시 후 다시 시도해주세요
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 빈 목록 상태
  if (favoriteStores.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
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