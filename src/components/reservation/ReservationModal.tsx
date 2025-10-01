"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useReservationList } from "../../hooks/useReservationList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User, Phone, Calendar } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import { formatMobileNumber, removeMobileNumberFormat } from "../../utils/formatMobileNumber";

interface StoreInfo {
  id: string;
  name: string;
  model: string;
  price: number;
  productCarrier?: string;
  conditions: string[];
  address?: string;
  phone?: string;
  businessHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
}

interface Product {
  id?: string;
  storage?: string;
  carrier?: string;
  conditions?: string;
  price?: number;
  products?: {
    id?: string;
    name?: string;
  };
}

interface ReservationFormData {
  date: string;
  time: string;
  name: string;
  phone: string;
}

interface ReservationModalProps {
  store: StoreInfo;
  firstProduct?: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReservationSuccess: () => void;
}

// 14일 내의 날짜 목록 생성
const generateDateOptions = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    let dayName = '';
    switch (dayOfWeek) {
      case 0: dayName = '일'; break;
      case 1: dayName = '월'; break;
      case 2: dayName = '화'; break;
      case 3: dayName = '수'; break;
      case 4: dayName = '목'; break;
      case 5: dayName = '금'; break;
      case 6: dayName = '토'; break;
    }
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    dates.push({
      value: dateString,
      label: `${month}/${day} (${dayName})`,
      isToday: i === 0,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }
  
  return dates;
};

// 영업시간에 따른 시간 슬롯 생성
const generateTimeSlots = (date: string, businessHours?: StoreInfo['businessHours']) => {
  const slots = [];
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  const today = new Date();
  
  // 오늘 날짜인지 확인
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  // 기본 영업시간 (매장 데이터가 없을 경우)
  let startHour = 9;
  let endHour = 21;
  
  if (businessHours) {
    let hoursString = '';
    if (dayOfWeek === 0) { // 일요일
      hoursString = businessHours.sunday;
    } else if (dayOfWeek === 6) { // 토요일
      hoursString = businessHours.saturday;
    } else { // 평일
      hoursString = businessHours.weekday;
    }
    
    // "09:00 - 21:00" 형식에서 시간 추출
    const timeMatch = hoursString.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      startHour = parseInt(timeMatch[1]);
      endHour = parseInt(timeMatch[3]);
    }
  }
  
  // 오늘 날짜인 경우 현재 시간 이후만 선택 가능하도록 조정
  if (isToday) {
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    // 현재 시간의 다음 30분 단위로 올림
    let nextAvailableHour = currentHour;
    let nextAvailableMinute = currentMinute < 30 ? 30 : 0;
    
    // 30분이 넘으면 다음 시간으로
    if (nextAvailableMinute === 0) {
      nextAvailableHour += 1;
    }
    
    // 최소 시작 시간을 현재 시간의 다음 30분 단위로 설정
    startHour = Math.max(startHour, nextAvailableHour);
  }
  
  // 30분 단위로 시간 슬롯 생성
  for (let hour = startHour; hour < endHour; hour++) {
    // 오늘 날짜이고 현재 시간과 같은 시간대인 경우
    if (isToday && hour === startHour) {
      // 30분 단위로만 추가 (00분은 제외)
      if (startHour < endHour - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    } else {
      // 일반적인 경우: 00분과 30분 모두 추가
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }
  
  return slots;
};

export default function ReservationModal({
  store,
  firstProduct,
  isOpen,
  onOpenChange,
  onReservationSuccess,
}: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    defaultValues: {
      date: "",
      time: "",
      name: "",
      phone: "",
    },
  });


  // 기존 예약 데이터 가져오기 (해당 매장의 예약만)
  const { data: existingReservations } = useReservationList({
    storeId: store.id,
    limit: 1000 // 충분히 큰 수로 모든 예약 가져오기
  });


  // 날짜 옵션 생성
  const dateOptions = generateDateOptions();

  // 선택된 날짜의 사용 가능한 시간 슬롯 생성
  const availableTimeSlots = selectedDate 
    ? generateTimeSlots(selectedDate, store.businessHours)
    : [];

  // 기존 예약이 있는 시간 슬롯 필터링
  const getBookedTimeSlots = (date: string) => {
    if (!existingReservations?.pages) return [];
    
    const allReservations = existingReservations.pages.flatMap(page => page.items);
    return allReservations
      .filter(reservation => 
        reservation.reservation_date === date && 
        (reservation.status === 'pending' || reservation.status === 'confirmed')
      )
      .map(reservation => reservation.reservation_time);
  };

  const bookedTimeSlots = selectedDate ? getBookedTimeSlots(selectedDate) : [];

  const onReservationSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    try {
      // 인증 헤더 가져오기
      const { getAuthHeaders } = await import('@/lib/auth');
      const authHeaders = await getAuthHeaders();
      
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          store_id: store.id,
          // product_id는 유효한 UUID가 있을 때만 전달, 없으면 null
          product_id: firstProduct?.products?.id || null,
          // store_product_id도 유효한 UUID가 있을 때만 전달
          store_product_id: firstProduct?.id || null,
          reservation_date: data.date,
          reservation_time: data.time,
          customer_name: data.name,
          customer_phone: removeMobileNumberFormat(data.phone),
          memo: '',
          product_snapshot: {
            id: firstProduct?.products?.id || null,
            name: firstProduct?.products?.name || store.model,
            model: firstProduct?.products?.name || store.model,
            storage: firstProduct?.storage || '256gb',
            price: firstProduct?.price || store.price,
            carrier: firstProduct?.carrier || store.productCarrier || 'kt',
            conditions: firstProduct?.conditions ? 
              String(firstProduct.conditions).replace(/[{}"]/g, '').split(',').map((c: string) => c.trim()) : 
              store.conditions,
            isDeleted: false
          },
          store_snapshot: {
            id: store.id,
            name: store.name,
            address: store.address || '',
            phone: store.phone || ''
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // 인증 오류 처리
        if (response.status === 401) {
          alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/auth/login';
          return;
        }
        
        // 과거 시간 예약 에러 처리
        if (response.status === 400 && errorData.error === 'PAST_TIME') {
          alert(errorData.message);
          return;
        }
        
        // 중복 예약 에러 처리
        if (response.status === 409 && errorData.error === 'DUPLICATE_RESERVATION') {
          alert(errorData.message);
          return;
        }
        
        throw new Error(errorData.message || "예약 생성에 실패했습니다.");
      }

      // 성공 처리
      onReservationSuccess();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      reset({ name: "", phone: "" });
    } catch (error) {
      console.error("예약 생성 오류:", error);
      alert(error instanceof Error ? error.message : "예약 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <span>예약하기</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>예약하기</DialogTitle>
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
              <Controller
                name="date"
                control={control}
                rules={{
                  required: "날짜를 선택해주세요",
                }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDate(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="날짜 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map((dateOption) => (
                        <SelectItem key={dateOption.value} value={dateOption.value}>
                          <div className="flex items-center space-x-2">
                            <span>{dateOption.label}</span>
                            {dateOption.isToday && (
                              <span className="text-xs text-blue-600 font-medium">오늘</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time) => {
                          const isBooked = bookedTimeSlots.includes(time);
                          
                          // 오늘 날짜인 경우 현재 시간과 비교
                          const isToday = selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString();
                          let isPastTime = false;
                          
                          if (isToday) {
                            const [timeHour, timeMinute] = time.split(':').map(Number);
                            const now = new Date();
                            const currentHour = now.getHours();
                            const currentMinute = now.getMinutes();
                            
                            // 현재 시간보다 이전인지 확인
                            isPastTime = timeHour < currentHour || 
                                        (timeHour === currentHour && timeMinute <= currentMinute);
                          }
                          
                          const isDisabled = isBooked || isPastTime;
                          
                          return (
                            <SelectItem 
                              key={time} 
                              value={time}
                              disabled={isDisabled}
                              className={isDisabled ? "text-muted-foreground opacity-50" : ""}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{time}</span>
                                {isPastTime && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (지난 시간)
                                  </span>
                                )}
                                {isBooked && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (예약됨)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          예약 가능한 시간이 없습니다
                        </div>
                      )}
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
              <Input
                id="name"
                placeholder="이름"
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
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "연락처를 입력해주세요",
                  pattern: {
                    value: /^010-\d{4}-\d{4}$/,
                    message: "올바른 연락처 형식을 입력해주세요 (010-1234-5678)"
                  }
                }}
                render={({ field }) => (
                  <Input
                    id="phone"
                    placeholder="010-1234-5678"
                    maxLength={13}
                    value={field.value}
                    onChange={(e) => {
                      const formatted = formatMobileNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                )}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* 예약 상품 정보 표시 */}
          <div className="space-y-2">
            <Label>예약 상품</Label>
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center">
                <div>
                  <div className="font-medium">
                    {store.model} · {(firstProduct?.storage ?? "256gb").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "예약 처리 중..." : "예약 신청"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
