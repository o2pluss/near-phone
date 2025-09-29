"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Clock,
  ArrowLeft,
  Calendar,
  Search,
  X,
} from "lucide-react";
import { useReservationList, useUpdateReservationStatus } from "../hooks/useReservationList";
import { transformApiReservationsToReservations } from "../utils/reservationDataTransform";
import type { Reservation } from "../types/reservation";
import { useRouter } from "next/navigation";

interface SellerScheduleProps {
  onBack: () => void;
}

// 동적으로 오늘 날짜 생성
const getTodayDate = () =>
  new Date().toISOString().split("T")[0];


export default function SellerSchedule({
  onBack,
}: SellerScheduleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // 오늘 날짜
  const today = getTodayDate();

  // API 훅 사용 (페이지네이션 지원)
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useReservationList({
    startDate: today,
    endDate: today,
    limit: 50, // 스케줄용으로 충분한 수량
  });
  
  const updateReservationStatus = useUpdateReservationStatus();
  
  // 모든 페이지의 데이터를 합쳐서 Reservation 타입으로 변환
  const allApiReservations = data?.pages.flatMap(page => page.items) || [];
  const reservations = transformApiReservationsToReservations(allApiReservations);
  
  // 디버깅을 위한 로그
  console.log('API 예약 데이터:', allApiReservations);
  console.log('변환된 예약 데이터:', reservations);

  // 검색 필터링 함수
  const filterReservationsBySearch = (
    reservations: Reservation[],
    query: string,
  ) => {
    if (!query.trim()) return reservations;

    const searchTerm = query.toLowerCase().trim();

    return reservations.filter((reservation) => {
      // 고객명으로 검색
      const nameMatch = reservation.customerName
        .toLowerCase()
        .includes(searchTerm);

      // 연락처 뒷자리 4글자로 검색 (010-1234-5678 → 5678)
      const phoneLastFour = reservation.customerPhone.slice(-4);
      const phoneMatch = phoneLastFour.includes(searchTerm);

      return nameMatch || phoneMatch;
    });
  };

  // 당일 예약 필터링 (확정된 예약과 종료된 예약)
  let todayConfirmedReservations = reservations.filter(
    (r) => r.date === today && (r.status === "confirmed" || r.status === "completed"),
  );

  // 검색어가 있으면 검색 필터 적용
  if (searchQuery.trim()) {
    todayConfirmedReservations = filterReservationsBySearch(
      todayConfirmedReservations,
      searchQuery,
    );
  }

  const clearSearch = () => {
    setSearchQuery("");
  };

  // 검색어 하이라이트 함수
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-200 font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  // 예약 상태 업데이트 핸들러 (종료 처리만)
  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    console.log('예약 상태 업데이트 시도:', { reservationId, newStatus });
    try {
      await updateReservationStatus.mutateAsync({
        reservationId,
        status: newStatus,
      });
      console.log('예약 상태 업데이트 성공');
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error);
    }
  };

  // 예약 상세보기로 이동
  const handleReservationClick = (reservationId: string) => {
    router.push(`/seller/reservations/${reservationId}`);
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <p className="text-muted-foreground">
              {new Date(today).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              placeholder="고객명 또는 휴대전화 뒷자리 4자"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="placeholder:text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              /* 검색 실행은 실시간으로 이미 적용됨 */
            }}
            className="px-4"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            '
            <span className="font-medium">{searchQuery}</span>
            ' 검색 결과: {todayConfirmedReservations.length}건
          </div>
        )}
      </div>

      {/* 시간대별 스케줄 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {searchQuery
                    ? "검색된 예약"
                    : "오늘의 예약"}
                </h3>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-md px-3 py-1"
            >
              {todayConfirmedReservations.length}건
            </Badge>
          </div>
        </CardContent>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">예약을 불러오는 중...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              예약을 불러오는데 실패했습니다.
            </div>
          ) : todayConfirmedReservations.length > 0 ? (
            <div className="space-y-3">
              {/* 시간대별 그룹화 */}
              {(() => {
                // 검색어가 있을 때와 없을 때 다른 로직 적용
                if (searchQuery.trim()) {
                  // 검색 시: 예약이 있는 시간대만 표시 (시간순 정렬)
                  const sortedReservations = [
                    ...todayConfirmedReservations,
                  ].sort((a, b) =>
                    a.time.localeCompare(b.time),
                  );

                  return sortedReservations.map(
                    (reservation, index) => {
                      return (
                        <div
                          key={reservation.id}
                          className="border-b border-border pb-3 last:border-b-0"
                        >
                          <div 
                            className={`rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                              reservation.status === 'completed' 
                                ? 'bg-gray-100 border border-gray-300' 
                                : 'bg-green-50 border border-green-200'
                            }`}
                            onClick={() => handleReservationClick(reservation.id)}
                          >
                            {/* HH:MM */}
                            <div className={`text-xl font-bold mb-2 ${
                              reservation.status === 'completed' 
                                ? 'text-gray-500' 
                                : 'text-primary'
                            }`}>
                              {reservation.time}
                            </div>

                            {/* 고객명 · 연락처 */}
                            <div className={`text-base font-medium mb-1 ${
                              reservation.status === 'completed' 
                                ? 'text-gray-600' 
                                : ''
                            }`}>
                              <span>
                                {searchQuery
                                  ? highlightText(
                                      reservation.customerName,
                                      searchQuery,
                                    )
                                  : reservation.customerName}
                              </span>
                              <span className="text-muted-foreground mx-2">
                                ·
                              </span>
                              <span className="text-muted-foreground">
                                {searchQuery
                                  ? highlightText(
                                      reservation.customerPhone,
                                      searchQuery,
                                    )
                                  : reservation.customerPhone}
                              </span>
                            </div>

                            {/* 모델명 및 용량 */}
                            <div className={`mb-1 ${
                              reservation.status === 'completed' 
                                ? 'text-gray-500' 
                                : 'text-muted-foreground'
                            }`}>
                              {reservation.model}
                            </div>

                            {/* 가격 및 종료 버튼 */}
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${
                                reservation.status === 'completed' 
                                  ? 'text-gray-500' 
                                  : 'text-blue-600'
                              }`}>
                                {reservation.price.toLocaleString()}원
                              </span>
                              {reservation.status === 'confirmed' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={updateReservationStatus.isPending}
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                      종료
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>예약 종료 확인</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        해당 예약을 종료 처리하시나요?
                                        <br />
                                        <span className="font-medium">
                                          {reservation.customerName} - {reservation.time}
                                        </span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>취소</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusUpdate(reservation.id, 'completed');
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        종료 처리
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  );
                } else {
                  // 일반 시간대별 표시
                  const timeSlots = Array.from(
                    { length: 12 },
                    (_, i) => {
                      const hour = i + 9; // 9시부터 20시까지
                      const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
                      const nextTimeSlot = `${(hour + 1).toString().padStart(2, "0")}:00`;

                      const reservationsInSlot =
                        todayConfirmedReservations
                          .filter(
                            (r) =>
                              r.time >= timeSlot &&
                              r.time < nextTimeSlot,
                          )
                          .sort((a, b) =>
                            a.time.localeCompare(b.time),
                          );

                      return {
                        slot: `${timeSlot} - ${nextTimeSlot}`,
                        hour: hour,
                        reservations: reservationsInSlot,
                      };
                    },
                  );

                  return timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 border-b border-border pb-3 last:border-b-0 min-h-[60px]"
                    >
                      {/* 시간대 */}
                      <div className="col-span-3 flex items-center">
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {slot.hour
                              .toString()
                              .padStart(2, "0")}
                            :00
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ~
                            {(slot.hour + 1)
                              .toString()
                              .padStart(2, "0")}
                            :00
                          </div>
                        </div>
                      </div>

                      {/* 예약 정보 */}
                      <div className="col-span-9">
                        {slot.reservations.length > 0 ? (
                          <div className="space-y-2">
                            {slot.reservations.map(
                              (reservation) => {
                                return (
                                  <div
                                    key={reservation.id}
                                    className={`rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${
                                      reservation.status === 'completed' 
                                        ? 'bg-gray-100 border border-gray-300' 
                                        : 'bg-green-50 border border-green-200'
                                    }`}
                                    onClick={() => handleReservationClick(reservation.id)}
                                  >
                                    {/* HH:MM */}
                                    <div className={`text-lg font-bold mb-2 ${
                                      reservation.status === 'completed' 
                                        ? 'text-gray-500' 
                                        : 'text-primary'
                                    }`}>
                                      {reservation.time}
                                    </div>

                                    {/* 고객명 · 연락처 */}
                                    <div className={`text-sm font-medium mb-1 ${
                                      reservation.status === 'completed' 
                                        ? 'text-gray-600' 
                                        : ''
                                    }`}>
                                      <span>
                                        {
                                          reservation.customerName
                                        }
                                      </span>
                                      <span className="text-muted-foreground mx-2">
                                        ·
                                      </span>
                                      <span className="text-muted-foreground">
                                        {
                                          reservation.customerPhone
                                        }
                                      </span>
                                    </div>

                                    {/* 모델명 및 용량 */}
                                    <div className={`text-sm font-bold ${
                                      reservation.status === 'completed' 
                                        ? 'text-gray-500' 
                                        : ''
                                    }`}>
                                      {reservation.model}
                                    </div>

                                    {/* 가격 및 종료 버튼 */}
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        reservation.status === 'completed' 
                                          ? 'text-gray-500' 
                                          : ''
                                      }`}>
                                        {reservation.price.toLocaleString()}원
                                      </span>
                                      {reservation.status === 'confirmed' && (
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              disabled={updateReservationStatus.isPending}
                                              className="text-green-600 border-green-600 hover:bg-green-50"
                                            >
                                              종료
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>예약 종료 확인</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                해당 예약을 종료 처리하시나요?
                                                <br />
                                                <span className="font-medium">
                                                  {reservation.customerName} - {reservation.time}
                                                </span>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>취소</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusUpdate(reservation.id, 'completed');
                                                }}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                종료 처리
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      )}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center h-full text-muted-foreground text-sm">
                            예약 없음
                          </div>
                        )}
                      </div>
                    </div>
                  ));
                }
              })()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery
                  ? "검색 결과가 없습니다"
                  : "오늘의 예약이 없습니다"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? (
                  <>
                    '
                    <span className="font-medium">
                      {searchQuery}
                    </span>
                    ' 검색어에 해당하는 예약이 없습니다.
                    <br />
                    다른 검색어를 시도해보세요.
                  </>
                ) : (
                  <>
                    예약 관리에서 대기중인 예약을 확인해보세요.
                  </>
                )}
              </p>
            </div>
          )}
          
          {/* 무한 스크롤 버튼 */}
          {hasNextPage && (
            <div className="flex justify-center py-6 border-t">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-w-[120px]"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    불러오는 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}