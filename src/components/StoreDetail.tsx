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
  Camera,
  MessageSquare
} from "lucide-react";
import { getConditionStyle } from "../lib/conditionStyles";
import ReviewList from "./ReviewList";
import ReservationModal from "./reservation/ReservationModal";
import ReservationSuccessDialog from "./reservation/ReservationSuccessDialog";
import type { ReviewStats } from "../types/review";
import { formatPrice } from "../utils/formatPrice";
import { useReviews, useReviewStats, useStoreSearch, useStore, useFavoriteStatus, useFavoriteMutations } from "@/hooks/useApi";
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
  selectedProduct?: any; // 매장 찾기에서 전달받은 상품 정보
}



export default function StoreDetail({
  storeId,
  onBack,
  hideConditionsAndBooking,
  user,
  profile,
  productId,
  selectedProduct,
}: StoreDetailProps) {
  const queryClient = useQueryClient();
  const productsQuery = useStoreSearch({ storeId }, { enabled: !!storeId });
  const reviewsQuery = useReviews({ storeId }, { enabled: !!storeId });
  const reviewStatsQuery = useReviewStats(storeId, { enabled: !!storeId });
  const storeQuery = useStore(storeId, { enabled: !!storeId });
  
  // 즐겨찾기 관련 훅들
  const userId = user?.id || 'anonymous';
  const favoriteStatusQuery = useFavoriteStatus(storeId, userId, { 
    enabled: !!storeId && userId !== 'anonymous' 
  });
  const { addFavorite, removeFavorite } = useFavoriteMutations(userId);
  
  // 선택된 상품 정보 (매장 찾기에서 전달받은 정보 우선 사용)
  const productInfo = selectedProduct || (() => {
    // selectedProduct가 없으면 productId로 찾기 (예약에서 온 경우)
    if (!productId || !productsQuery.data) return null;
    
    const allProducts = productsQuery.data.pages.flatMap((page: any) => page.items || []);
    return allProducts.find((product: any) => product.id === productId) || null;
  })();

  console.log('StoreDetail - productId:', productId);
  console.log('StoreDetail - selectedProduct:', selectedProduct);
  console.log('StoreDetail - productInfo:', productInfo);
  console.log('StoreDetail - storeQuery.data:', storeQuery.data);
  console.log('StoreDetail - productsQuery.data:', productsQuery.data);
  
  // 실제 매장 데이터와 상품 데이터를 조합 (실제 데이터만 사용)
  const store: Store = {
    id: storeId,
    name: storeQuery.data?.name || "",
    address: storeQuery.data?.address || "",
    address_detail: storeQuery.data?.address_detail || "",
    phone: storeQuery.data?.phone || "",
    rating: storeQuery.data?.rating || 0,
    reviewCount: storeQuery.data?.review_count || 0,
    model: productInfo?.device_models?.device_name || productInfo?.device_models?.model_name || "",
    price: productInfo?.price || 0,
    originalPrice: productInfo?.price || 0,
    conditions: productInfo?.conditions || [],
    hours: storeQuery.data?.hours?.weekday || "",
    description: storeQuery.data?.description || "",
    businessHours: storeQuery.data?.hours ? {
      weekday: storeQuery.data.hours.weekday || "",
      saturday: storeQuery.data.hours.saturday || "",
      sunday: storeQuery.data.hours.sunday || ""
    } : undefined,
    productCarrier: productInfo?.carrier ? (() => {
      const carrier = productInfo.carrier.toLowerCase();
      if (carrier === 'kt') return 'kt';
      if (carrier === 'skt') return 'skt';
      if (carrier === 'lgu' || carrier === 'lg u+') return 'lgu';
      return 'kt';
    })() : undefined,
    images: storeQuery.data?.images || [],
    distance: 0.5, // 기본값 (실제로는 위치 기반 계산 필요)
  };


  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);
  
  // 즐겨찾기 상태 (로컬 상태 + 서버 상태 조합)
  const [localFavoriteState, setLocalFavoriteState] = useState<boolean | null>(null);
  
  // 서버 상태가 로딩 중이거나 없으면 기본값 false (하트 꺼진 상태)
  const serverFavoriteState = favoriteStatusQuery.isLoading || !favoriteStatusQuery.data 
    ? false 
    : favoriteStatusQuery.data.isFavorite;
    
  const isFavorite = localFavoriteState !== null ? localFavoriteState : serverFavoriteState;
  
  // 서버 상태 로딩 중이면 기본값 false 사용
  const isLoadingFavoriteStatus = favoriteStatusQuery.isLoading;
  
  // 서버 상태가 변경되면 로컬 상태 초기화
  useEffect(() => {
    if (favoriteStatusQuery.data) {
      setLocalFavoriteState(null);
    }
  }, [favoriteStatusQuery.data]);
  
  // 컴포넌트 마운트 시 즐겨찾기 상태 확인
  useEffect(() => {
    if (userId !== 'anonymous' && storeId) {
      favoriteStatusQuery.refetch();
    }
  }, [userId, storeId]);
  
  // 리뷰 상태 관리

  const router = useRouter();


  const toggleFavorite = async () => {
    // 익명 사용자는 즐겨찾기 불가
    if (userId === 'anonymous') {
      alert('즐겨찾기 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }

    // 현재 서버 상태를 기준으로 새 상태 결정
    const currentServerState = serverFavoriteState;
    const newFavoriteState = !currentServerState;
    
    console.log('즐겨찾기 토글:', {
      currentServerState,
      newFavoriteState,
      localFavoriteState,
      isFavorite
    });
    
    // 로컬 상태를 먼저 업데이트 (즉시 UI 반영)
    setLocalFavoriteState(newFavoriteState);

    try {
      if (currentServerState) {
        // 현재 즐겨찾기 상태이므로 제거
        await removeFavorite.mutateAsync(storeId);
      } else {
        // 현재 즐겨찾기 상태가 아니므로 추가
        await addFavorite.mutateAsync({
          storeId,
          productId: productInfo?.id,
          productSnapshot: productInfo ? {
            id: productInfo.id,
            name: productInfo.device_models?.device_name || productInfo.device_models?.model_name || '',
            model: productInfo.device_models?.model_name || '',
            storage: productInfo.storage || '256GB',
            price: productInfo.price || 0,
            carrier: productInfo.carrier || 'kt',
            conditions: productInfo.conditions || [],
            isDeleted: false,
          } : undefined
        });
      }
      
      // 성공 시 로컬 상태 초기화 (React Query가 자동으로 캐시 무효화)
      setLocalFavoriteState(null);
    } catch (error: any) {
      console.error('즐겨찾기 토글 오류:', error);
      
      // 409 오류 (이미 즐겨찾기에 있음) 처리
      if (error?.message?.includes('Already in favorites') || error?.status === 409) {
        console.log('이미 즐겨찾기에 있음 - 서버 상태와 동기화');
        // 서버 상태를 다시 확인하고 동기화
        favoriteStatusQuery.refetch();
        setLocalFavoriteState(null);
        return;
      }
      
      // 다른 오류의 경우 롤백
      setLocalFavoriteState(currentServerState);
      alert(error instanceof Error ? error.message : '즐겨찾기 처리 중 오류가 발생했습니다.');
    }
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
          <div className="text-sm text-muted-foreground mt-2">상품 정보를 확인하고 있습니다</div>
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
              disabled={addFavorite.isPending || removeFavorite.isPending || isLoadingFavoriteStatus}
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
                  {store.name || "매장명 정보 없음"}
                </div>
                <div className="ml-2 text-gray-400 text-sm">
                  {store.distance}km
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                <span className="font-medium">
                  {reviewStatsQuery.data?.averageRating?.toFixed(1) || store.rating || 0}
                </span>
                <span>({reviewStatsQuery.data?.totalReviews || store.reviewCount || 0})</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <div className="text-muted-foreground">
              {store.description}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3 border-t pt-4">
            {(store.address || store.address_detail) && (
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-muted-foreground">
                    {store.address} {store.address_detail}
                  </div>
                </div>
              </div>
            )}

            {store.phone && (
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-muted-foreground">
                    {store.phone}
                  </div>
                </div>
              </div>
            )}

            {(store.businessHours || store.hours) && (
              <div className="space-y-1">
                <h4 className="font-medium text-sm">영업시간</h4>
                {store.businessHours ? (
                  <div className="text-muted-foreground text-sm space-y-0.5">
                    {store.businessHours.weekday && <div>평일: {store.businessHours.weekday}</div>}
                    {store.businessHours.saturday && <div>토요일: {store.businessHours.saturday}</div>}
                    {store.businessHours.sunday && <div>일요일: {store.businessHours.sunday}</div>}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    {store.hours}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Info - 예약에서 온 경우 숨김, 실제 데이터가 있을 때만 표시 */}
          {!hideConditionsAndBooking && productInfo && (
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <div className="space-y-2">
                {/* 상품 정보 표시 - 실제 데이터가 있을 때만 */}
                {productInfo.device_models && productInfo.device_models.manufacturer && productInfo.device_models.device_name && (
                  <div className="font-medium">
                    {getManufacturerDisplayName(productInfo.device_models.manufacturer)} · {productInfo.device_models.device_name} · {productInfo.storage?.toUpperCase()}
                  </div>
                )}
                
                {/* 배지들 - 실제 데이터가 있을 때만 */}
                <div className="flex flex-wrap gap-2">
                  {/* 통신사 CHIP (맨 앞에 표시) */}
                  {productInfo.carrier && (
                    <Badge className="text-xs px-1.5 py-0.5 border bg-blue-50 border-blue-200 text-blue-700">
                      {getCarrierLabel(productInfo.carrier.toUpperCase() as any)}
                    </Badge>
                  )}
                  
                  {/* 조건 배지들 */}
                  {productInfo.conditions && productInfo.conditions.length > 0 && (
                    productInfo.conditions.map((condition: string, index: number) => {
                      const { className } = getConditionStyle(condition);
                      return (
                        <Badge
                          key={index}
                          className={`text-xs px-1.5 py-0.5 border ${className}`}
                        >
                          {condition}
                        </Badge>
                      );
                    })
                  )}
                </div>
                
                {/* 가격 정보 - 실제 데이터가 있을 때만 */}
                {productInfo.price && (
                  <div className="flex justify-end">
                    <span className="font-semibold text-blue-600">
                      {formatPrice(productInfo.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-6 border-t">
            {reviewsQuery.isLoading || reviewStatsQuery.isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="font-semibold">리뷰</h3>
                </div>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">리뷰를 불러오는 중...</p>
                </div>
              </div>
            ) : reviewsQuery.error || reviewStatsQuery.error ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <h3 className="font-semibold">리뷰</h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">리뷰를 불러오는 중 오류가 발생했습니다.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      reviewsQuery.refetch();
                      reviewStatsQuery.refetch();
                    }}
                    className="mt-2"
                  >
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : (
              <ReviewList
                storeId={store.id}
                reviews={reviewsQuery.data?.pages.flatMap((p: any) => p.items) ?? []}
                reviewStats={reviewStatsQuery.data ?? {
                  totalReviews: 0,
                  averageRating: 0,
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
            )}
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