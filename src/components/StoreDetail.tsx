import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  Calendar,
  Smartphone,
  Share,
  ChevronLeft,
  ChevronRight,
  Camera
} from "lucide-react";
import { getConditionStyle } from "../lib/conditionStyles";
import ReviewList from "./ReviewList";
import ReservationModal from "./reservation/ReservationModal";
import ReservationSuccessDialog from "./reservation/ReservationSuccessDialog";
import type { ReviewStats } from "../types/review";
import { formatPrice } from "../utils/formatPrice";
import { useReviews, useStoreSearch, useStore } from "@/hooks/useApi";
import { MANUFACTURER_LABELS, getCarrierLabel } from "@/lib/constants/codes";

// 제조사명을 한글로 변환하는 함수
const getManufacturerDisplayName = (manufacturer: string): string => {
  return MANUFACTURER_LABELS[manufacturer as keyof typeof MANUFACTURER_LABELS] || manufacturer;
};

interface Store {
  id: string;
  name: string;
  address: string;
  address_detail: string;
  distance: number;
  phone: string;
  rating: number;
  reviewCount: number;
  model: string;
  price: number;
  originalPrice?: number;
  conditions: string[];
  hours: string;
  description?: string;
  businessHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  productCarrier?: "kt" | "skt" | "lgu";
  images?: string[];
}

interface ReservationFormData {
  date: string;
  time: string;
  name: string;
  phone: string;
}

interface StoreDetailProps {
  storeId: string;
  onBack: () => void;
  hideConditionsAndBooking?: boolean;
  user?: any;
  profile?: any;
  productId?: string | null;
}



export default function StoreDetail({
  storeId,
  onBack,
  hideConditionsAndBooking,
  user,
  profile,
  productId,
}: StoreDetailProps) {
  const queryClient = useQueryClient();
  const productsQuery = useStoreSearch({ storeId }, { enabled: !!storeId });
  const reviewsQuery = useReviews({ storeId }, { enabled: !!storeId });
  const storeQuery = useStore(storeId, { enabled: !!storeId });
  
  // 선택된 상품 정보 찾기
  const selectedProduct = useMemo(() => {
    if (!productId || !productsQuery.data) return null;
    
    const allProducts = productsQuery.data.pages.flatMap((page: any) => page.items || []);
    return allProducts.find((product: any) => product.id === productId) || null;
  }, [productId, productsQuery.data]);

  // 선택된 상품 정보 (항상 존재)
  const productInfo = selectedProduct || {
    id: '',
    store_id: '',
    device_model_id: '',
    carrier: 'KT',
    storage: '256GB',
    price: 0,
    conditions: [],
    is_active: true,
    created_at: '',
    updated_at: '',
    device_models: {
      id: '',
      manufacturer: '',
      device_name: '상품 정보 없음',
      model_name: '',
      image_url: ''
    },
    product_tables: {
      id: '',
      name: '',
      exposure_start_date: '',
      exposure_end_date: '',
      is_active: true
    }
  };

  console.log('StoreDetail - productId:', productId);
  console.log('StoreDetail - selectedProduct:', selectedProduct);
  console.log('StoreDetail - productInfo:', productInfo);
  
  // 실제 매장 데이터와 상품 데이터를 조합
  const store: Store = {
    id: storeId,
    name: storeQuery.data?.name ?? "매장 정보 없음",
    address: storeQuery.data?.address ?? "",
    address_detail: storeQuery.data?.address_detail ?? "",
    phone: storeQuery.data?.phone ?? "-",
    rating: storeQuery.data?.rating ?? 0,
    reviewCount: storeQuery.data?.review_count ?? 0,
    model: productInfo.device_models?.device_name ?? productInfo.device_models?.model_name ?? "상품 정보 없음",
    price: productInfo.price ?? 0,
    originalPrice: productInfo.price ?? 0,
    conditions: productInfo.conditions || [],
    hours: storeQuery.data?.hours?.weekday ?? "09:00 - 21:00", // 서버에서 가져온 영업시간
    description: storeQuery.data?.description ?? "매장 설명이 없습니다.",
    businessHours: storeQuery.data?.hours ? {
      weekday: storeQuery.data.hours.weekday ?? "09:00 - 21:00",
      saturday: storeQuery.data.hours.saturday ?? "10:00 - 20:00",
      sunday: storeQuery.data.hours.sunday ?? "10:00 - 19:00"
    } : {
      weekday: "09:00 - 21:00",
      saturday: "10:00 - 20:00",
      sunday: "10:00 - 19:00"
    },
    productCarrier: (() => {
      const carrier = productInfo.carrier?.toLowerCase();
      if (carrier === 'kt') return 'kt';
      if (carrier === 'skt') return 'skt';
      if (carrier === 'lgu' || carrier === 'lg u+') return 'lgu';
      return 'kt';
    })(),
    images: storeQuery.data?.images && storeQuery.data.images.length > 0 ? storeQuery.data.images : [
      "https://images.unsplash.com/photo-1723133741318-0f5c5afcf19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHN0b3JlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU4NTEzMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1584658645175-90788b3347b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9uZSUyMHN0b3JlJTIwZGlzcGxheXxlbnwxfHx8fDE3NTg1MTMyODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1703165552745-37e85f0273cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHJldGFpbCUyMHN0b3JlfGVufDF8fHx8MTc1ODUxMzI4OXww&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    distance: 0.5, // 기본값 (실제로는 위치 기반 계산 필요)
  };


  const [isFavorite, setIsFavorite] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  
  // 리뷰 상태 관리

  const router = useRouter();


  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleReservationSuccess = () => {
    setShowReservationSuccess(true);
  };


  // Image slider functions
  const hasImages = store.images && store.images.length > 0;
  
  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev === store.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? store.images!.length - 1 : prev - 1
      );
    }
  };


  // 로딩 상태 처리
  if (storeQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="text-lg text-muted-foreground">매장 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (storeQuery.isError || productsQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="text-lg text-red-600">매장 정보를 불러올 수 없습니다.</div>
          <Button onClick={onBack} className="mt-4">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="border-b px-4 py-3 sticky top-0 z-10" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
            <Share className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </header>

      <div className="space-y-0">
        {/* Store Images Slider */}
        <div className="h-48 relative overflow-hidden">
          {hasImages ? (
            <>
              {/* 메인 이미지 */}
              <div className="w-full h-full relative">
                <img
                  src={store.images![currentImageIndex]}
                  alt={`${store.name} 매장 사진 ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 좌우 네비게이션 버튼 */}
              {store.images!.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-8 h-8 p-0"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white w-8 h-8 p-0"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* 이미지 인디케이터 */}
              {store.images!.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {store.images!.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              {/* 이미지 카운터 */}
              {store.images!.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/20 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {store.images!.length}
                </div>
              )}
            </>
          ) : (
            // 기본 플레이스홀더
            <div className="h-48 bg-gradient-to-r from-blue-100 to-green-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">매장 사진이 없습니다</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="p-4 space-y-4">
          {/* Price and Title */}
          <div>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="font-semibold text-lg">
                  {store.name}
                </div>
                <div className="ml-2 text-gray-400 text-sm">
                  {store.distance}km
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {store.rating}
                </span>
                <span>({store.reviewCount}명)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-muted-foreground">
            {store.description || ""}
          </div>

          {/* Contact Info */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-muted-foreground">
                  {store.address} {store.address_detail}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div>
                <div className="text-muted-foreground">
                  {store.phone}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-sm">영업시간</h4>
              {store.businessHours ? (
                <div className="text-muted-foreground text-sm space-y-0.5">
                  <div>평일: {store.businessHours.weekday}</div>
                  <div>토요일: {store.businessHours.saturday}</div>
                  <div>일요일: {store.businessHours.sunday}</div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  {store.hours}
                </div>
              )}
            </div>
          </div>

          {/* Additional Info - 예약에서 온 경우 숨김 */}
          {!hideConditionsAndBooking && (
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <div className="space-y-2">
                 {productInfo.device_models && (
                   <div>
                     {getManufacturerDisplayName(productInfo.device_models.manufacturer)} · {productInfo.device_models.device_name} · {(productInfo.storage).toUpperCase()}
                   </div>
                 )}
                <div className="flex flex-wrap gap-2">
                  {/* 통신사 CHIP (맨 앞에 표시) */}
                  {productInfo.carrier && (
                    <Badge className="text-xs px-1.5 py-0.5 border bg-blue-50 border-blue-200 text-blue-700">
                      {getCarrierLabel(productInfo.carrier.toUpperCase() as any)}
                    </Badge>
                  )}
                  {productInfo.conditions.map((condition, index) => {
                    const { className } = getConditionStyle(condition);
                    return (
                      <Badge
                        key={index}
                        className={`text-xs px-1.5 py-0.5 border ${className}`}
                      >
                        {condition}
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <span className="font-semibold text-blue-600">
                    {formatPrice(productInfo.price)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-6 border-t">
            <ReviewList
              storeId={store.id}
              reviews={reviewsQuery.data?.pages.flatMap((p: any) => p.items) ?? []}
              reviewStats={{
                totalReviews: reviewsQuery.data?.pages.flatMap((p: any) => p.items).length ?? 0,
                averageRating: store.rating,
                ratingDistribution: {
                  5: 0,
                  4: 0,
                  3: 0,
                  2: 0,
                  1: 0
                }
              }}
              currentUserId="user-1" // 현재 사용자 ID (실제로는 인증 상태에서 가져와야 함)
              hasMore={reviewsQuery.hasNextPage ?? false}
              onLoadMore={async () => {
                if (reviewsQuery.hasNextPage) {
                  await reviewsQuery.fetchNextPage();
                }
              }}
              loading={reviewsQuery.isFetchingNextPage ?? false}
              initialDisplayCount={3}
              loadMoreCount={15} // 서버 페이지 크기 (15개)
              enableInfiniteScroll={false} // 매장 상세에서는 Load More 버튼 방식 사용
            />
          </div>
        </div>
      </div>

      {/* Floating Reservation Button - 예약에서 온 경우 숨김 */}
      {!hideConditionsAndBooking && (
        <div className="fixed left-1/2 transform -translate-x-1/2 z-50 bottom-20">
          <ReservationModal
            store={store}
            firstProduct={productInfo}
            isOpen={isReservationOpen}
            onOpenChange={setIsReservationOpen}
            onReservationSuccess={handleReservationSuccess}
          />
        </div>
      )}



      {/* 예약 종료 다이얼로그 */}
      <ReservationSuccessDialog
        isOpen={showReservationSuccess}
        onOpenChange={setShowReservationSuccess}
      />
    </div>
  );
}