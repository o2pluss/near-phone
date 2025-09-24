import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useForm, Controller } from "react-hook-form";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  Calendar,
  User,
  Smartphone,
  Share,
  ChevronLeft,
  ChevronRight,
  Camera
} from "lucide-react";
import { getConditionStyle } from "../lib/conditionStyles";
import ReviewList from "./ReviewList";
import type { ReviewWithUser, ReviewStats } from "../types/review";
import { formatPrice } from "../utils/formatPrice";
import { useReviews, useStoreProducts, useStore } from "@/hooks/useApi";

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
  originalPrice?: number;
  conditions: string[];
  hours: string;
  description?: string;
  businessHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
    special?: string;
  };
  productCarrier?: "kt" | "skt" | "lgu";
  images?: string[];
}

interface ReservationFormData {
  date: string;
  time: string;
  name: string;
  phone: string;
  model: string;
  price: number;
}

interface StoreDetailProps {
  storeId: string;
  onBack: () => void;
  hideConditionsAndBooking?: boolean;
}



export default function StoreDetail({
  storeId,
  onBack,
  hideConditionsAndBooking,
}: StoreDetailProps) {
  const productsQuery = useStoreProducts({ storeId }, { enabled: !!storeId });
  const reviewsQuery = useReviews({ storeId }, { enabled: !!storeId });
  const storeQuery = useStore(storeId, { enabled: !!storeId });
  
  // 첫 번째 상품 정보 (가격, 모델 등)
  const firstProduct = productsQuery.data?.pages[0]?.items?.[0];
  
  // 실제 매장 데이터와 상품 데이터를 조합
  const store: Store = {
    id: storeId,
    name: storeQuery.data?.name ?? "매장 정보 없음",
    address: storeQuery.data?.address ?? "주소 정보 없음",
    phone: storeQuery.data?.phone ?? "-",
    rating: storeQuery.data?.rating ?? 0,
    reviewCount: storeQuery.data?.review_count ?? 0,
    model: firstProduct?.products?.name ?? "상품 정보 없음",
    price: firstProduct?.price ?? 0,
    originalPrice: firstProduct?.discount_price ?? firstProduct?.price ?? 0,
    conditions: firstProduct?.conditions ? 
      String(firstProduct.conditions).replace(/[{}"]/g, '').split(',').map((c: string) => c.trim()) : 
      [],
    hours: "09:00 - 21:00", // 기본 영업시간
    description: storeQuery.data?.description ?? "매장 설명이 없습니다.",
    businessHours: {
      weekday: "09:00 - 21:00",
      saturday: "10:00 - 20:00",
      sunday: "10:00 - 19:00"
    },
    productCarrier: firstProduct?.carrier ?? "kt",
    images: [
      "https://images.unsplash.com/photo-1723133741318-0f5c5afcf19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHN0b3JlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU4NTEzMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1584658645175-90788b3347b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9uZSUyMHN0b3JlJTIwZGlzcGxheXxlbnwxfHx8fDE3NTg1MTMyODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1703165552745-37e85f0273cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHJldGFpbCUyMHN0b3JlfGVufDF8fHx8MTc1ODUxMzI4OXww&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    distance: 0.5, // 기본값 (실제로는 위치 기반 계산 필요)
  };


  const [isFavorite, setIsFavorite] = useState(false);
  const [isReservationOpen, setIsReservationOpen] =
    useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reservationData, setReservationData] =
    useState<ReservationFormData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 리뷰 상태 관리
  const [userReview, setUserReview] = useState<ReviewWithUser | null>(null);
  const [showUserReview, setShowUserReview] = useState(false);

  // 현재 사용자 ID (실제로는 auth store에서 가져와야 함)
  const currentUserId = "user-1";
  
  // 현재 사용자가 작성한 리뷰 찾기 (API 데이터만 사용)
  React.useEffect(() => {
    const apiReviews = reviewsQuery.data?.pages.flatMap((p: any) => p.items) as ReviewWithUser[] | undefined;
    const existingReview = apiReviews?.find(review => (review as any).userId === currentUserId);
    if (existingReview) {
      setUserReview(existingReview);
    } else {
      setUserReview(null);
    }
  }, [reviewsQuery.data, currentUserId]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReservationFormData>({
    defaultValues: {
      name: "김고객",
      phone: "010-1234-5678",
      model: store.model,
      price: store.price,
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const onReservationSubmit = (data: ReservationFormData) => {
    setReservationData(data);
    setIsReservationOpen(false);
    setIsConfirmOpen(true);
  };

  const confirmReservation = async () => {
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '00000000-0000-0000-0000-000000000001',
          store_id: storeId,
          reservation_date: reservationData?.date,
          reservation_time: reservationData?.time,
          customer_name: reservationData?.name,
          customer_phone: reservationData?.phone,
          memo: '',
        }),
      });
      setIsConfirmOpen(false);
      alert('예약이 완료되었습니다! 매장에서 연락드릴 예정입니다.');
    } catch (e) {
      alert('예약 처리 중 오류가 발생했습니다.');
    }
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

  // Generate available time slots
  const generateTimeSlots = (date: string) => {
    const slots = [];
    const isWeekend =
      new Date(date).getDay() === 0 ||
      new Date(date).getDay() === 6;
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? 20 : 21;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const availableTimeSlots = selectedDate
    ? generateTimeSlots(selectedDate)
    : [];

  // 로딩 상태 처리
  if (storeQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="text-lg text-muted-foreground">매장 정보를 불러오는 중...</div>
          <div className="text-sm text-muted-foreground mt-2">storeId: {storeId}</div>
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
          <div className="text-sm text-muted-foreground mt-2">storeId: {storeId}</div>
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
                  className="w-full h-full object-cover"
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
                <div className="text-muted-foreground text-sm">
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
            {store.description ||
              "최신 스마트폰을 합리적인 가격에 제공하는 신뢰할 수 있는 매장입니다. 전문 상담사가 고객 맞춤형 요금제를 안내해드립니다."}
          </div>

          {/* Contact Info */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-muted-foreground">
                  {store.address}
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
                  {store.businessHours.special && (
                    <div className="text-orange-600">{store.businessHours.special}</div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  {store.hours}
                </div>
              )}
            </div>
          </div>

          {/* Conditions - 예약에서 온 경우 숨김 */}
          {!hideConditionsAndBooking && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">조건</h4>
              <div className="space-y-2">
                <div className="text-muted-foreground">
                  {store.model} · {(firstProduct?.storage ?? "256gb").toUpperCase()}
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* 통신사 CHIP (맨 앞에 표시) */}
                  {store.productCarrier && (
                    <Badge className="text-xs px-1.5 py-0.5 border bg-blue-50 border-blue-200 text-blue-700">
                      {store.productCarrier.toUpperCase()}
                    </Badge>
                  )}
                  {store.conditions.map((condition, index) => {
                    const { icon: IconComponent, className } = getConditionStyle(condition);
                    return (
                      <Badge
                        key={index}
                        className={`text-xs px-1.5 py-0.5 border ${className}`}
                      >
                        <div className="flex items-center gap-0.5">
                          {IconComponent && (
                            <IconComponent className="h-2.5 w-2.5" />
                          )}
                          <span>{condition}</span>
                        </div>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info - 예약에서 온 경우 숨김 */}
          {!hideConditionsAndBooking && (
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>할인가</span>
                  <span className="font-semibold text-blue-600">
                    {formatPrice(store.price)}
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

      {/* Bottom Buttons - 예약에서 온 경우 숨김 */}
      {!hideConditionsAndBooking && (
        <div className="sticky bottom-0 border-t p-4" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="flex space-x-3">
            <div className="flex space-x-2">
              <Dialog
                open={isReservationOpen}
                onOpenChange={setIsReservationOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    예약하기
                  </Button>
                </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>매장 예약</DialogTitle>
                  <DialogDescription>
                    방문 일정을 선택해주세요
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleSubmit(onReservationSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">날짜</Label>
                      <Input
                        id="date"
                        type="date"
                        min={
                          new Date().toISOString().split("T")[0]
                        }
                        {...register("date", {
                          required: "날짜를 선택해주세요",
                        })}
                      />
                      {errors.date && (
                        <p className="text-sm text-destructive">
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">시간</Label>
                      <Controller
                        name="time"
                        control={control}
                        rules={{
                          required: "시간을 선택해주세요",
                        }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedDate}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="시간 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimeSlots.map((time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                >
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.time && (
                        <p className="text-sm text-destructive">
                          {errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="이름을 입력하세요"
                        className="pl-10"
                        {...register("name", {
                          required: "이름을 입력해주세요",
                        })}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">연락처</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="연락처를 입력하세요"
                        className="pl-10"
                        {...register("phone", {
                          required: "연락처를 입력해주세요",
                        })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsReservationOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      예약 신청
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* 리뷰 버튼 */}
            {userReview ? (
              <Button
                variant="outline"
                onClick={() => setShowUserReview(true)}
                className="flex-1"
              >
                내 리뷰 보기
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  // 리뷰 작성 페이지로 이동하는 로직
                  alert("리뷰 작성 기능은 예약 완료 후 이용 가능합니다.");
                }}
                className="flex-1"
              >
                리뷰 쓰기
              </Button>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog - 예약에서 온 경우에도 표시 */}
      {!hideConditionsAndBooking && (
        <Dialog
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>예약 확인</DialogTitle>
              <DialogDescription>
                예약 정보를 확인해주세요
              </DialogDescription>
            </DialogHeader>

            {reservationData && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      매장
                    </span>
                    <span className="font-medium">
                      {store.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      날짜
                    </span>
                    <span className="font-medium">
                      {reservationData.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      시간
                    </span>
                    <span className="font-medium">
                      {reservationData.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      이름
                    </span>
                    <span className="font-medium">
                      {reservationData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      연락처
                    </span>
                    <span className="font-medium">
                      {reservationData.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      상품
                    </span>
                    <span className="font-medium">
                      {reservationData.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      할인가
                    </span>
                    <span className="font-medium text-blue-600">
                      {formatPrice(reservationData.price)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
              >
                수정
              </Button>
              <Button
                onClick={confirmReservation}
                className="bg-green-600 hover:bg-green-700"
              >
                예약 확정
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* User Review Dialog */}
      <Dialog open={showUserReview} onOpenChange={setShowUserReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>내가 작성한 리뷰</DialogTitle>
            <DialogDescription>
              {store.name}에 대한 리뷰
            </DialogDescription>
          </DialogHeader>

          {userReview && (
            <div className="space-y-4">
              {/* 별점 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">평점:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= userReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">
                    {userReview.rating}.0
                  </span>
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">리뷰 내용:</span>
                <p className="text-sm border rounded-lg p-3 bg-gray-50">
                  {userReview.content}
                </p>
              </div>

              {/* 작성일 */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>작성일:</span>
                <span>
                  {new Date(userReview.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserReview(false)}
            >
              닫기
            </Button>
            <Button
              onClick={() => {
                // 리뷰 수정 기능 추가 가능
                alert("리뷰 수정 기능은 추후 업데이트 예정입니다.");
              }}
            >
              수정하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}