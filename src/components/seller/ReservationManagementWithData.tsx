"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Users, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReservationList, useUpdateReservationStatus } from "../../hooks/useReservationList";
import { transformApiReservationsToReservations } from "../../utils/reservationDataTransform";
import ReservationStats from "./ReservationStats";
import ReservationFilters from "./ReservationFilters";
import ReservationCard from "./ReservationCard";

interface ReservationManagementWithDataProps {}

export default function ReservationManagementWithData({}: ReservationManagementWithDataProps) {
  const router = useRouter();
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 실제 적용된 필터 상태
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<"all" | string>("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  // API 훅 사용 (서버에서 필터링, 페이지네이션 지원)
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useReservationList({
    status: appliedStatusFilter !== "all" ? appliedStatusFilter : undefined,
    startDate: appliedStartDate || undefined,
    endDate: appliedEndDate || undefined,
    search: appliedSearchQuery || undefined,
    limit: 20, // 페이지당 20개씩 로드
  });

  // 통계용 별도 API 호출 (필터링 없이 모든 데이터)
  const { data: statsData } = useReservationList({
    limit: 1000, // 통계용으로 충분한 수량
  });
  
  const updateReservationStatus = useUpdateReservationStatus();
  
  // 모든 페이지의 데이터를 합쳐서 Reservation 타입으로 변환
  const allApiReservations = data?.pages.flatMap(page => page.items) || [];
  const reservations = transformApiReservationsToReservations(allApiReservations);

  // 통계용 데이터 (필터링 없이 모든 예약)
  const allStatsApiReservations = statsData?.pages.flatMap(page => page.items) || [];
  const allReservations = transformApiReservationsToReservations(allStatsApiReservations);

  // 각 버튼별 정확한 통계 계산 (모든 예약 데이터 기준)
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘 예약: reservation_date가 오늘인 모든 상태
    const todayReservations = allReservations.filter(res => res.date === today);
    
    // 대기중: 모든 날짜의 pending 상태
    const pendingReservations = allReservations.filter(res => res.status === 'pending');
    
    // 확정/완료: 모든 날짜의 confirmed + completed 상태
    const confirmedCompletedReservations = allReservations.filter(res => 
      res.status === 'confirmed' || res.status === 'completed'
    );
    
    return {
      today: todayReservations.length,
      pending: pendingReservations.length,
      confirmedCompleted: confirmedCompletedReservations.length,
    };
  }, [allReservations]);

  // 검색 실행
  const handleSearch = () => {
    setAppliedStatusFilter(statusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedSearchQuery(searchQuery);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setAppliedStatusFilter("all");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedSearchQuery("");
  };

  // 예약 상태 업데이트
  const handleReservationUpdate = async (reservationId: string, status: string) => {
    try {
      await updateReservationStatus.mutateAsync({
        reservationId,
        status
      });
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error);
      alert('예약 상태 업데이트에 실패했습니다.');
    }
  };

  // 필터 버튼 핸들러
  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    // 오늘 예약: 상태 전체, 시작날짜 오늘, 종료날짜 오늘
    setStatusFilter("all");
    setStartDate(today);
    setEndDate(today);
    setAppliedStatusFilter("all");
    setAppliedStartDate(today);
    setAppliedEndDate(today);
  };

  const handlePendingClick = () => {
    // 대기중: 상태 대기, 시작날짜 없음, 종료날짜 없음
    setStatusFilter("pending");
    setStartDate("");
    setEndDate("");
    setAppliedStatusFilter("pending");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  const handleConfirmedClick = () => {
    // 확정/완료: 상태 확정+완료, 시작날짜 없음, 종료날짜 없음
    setStatusFilter("confirmed,completed");
    setStartDate("");
    setEndDate("");
    setAppliedStatusFilter("confirmed,completed");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">예약 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-lg text-red-600">예약 목록을 불러올 수 없습니다.</div>
          <div className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          예약 관리
        </h3>
        <Button 
          variant="outline" 
          onClick={() => router.push('/seller/schedule')}
        >
          <span>스케줄 보기</span>
        </Button>
      </div>

      {/* 당일 예약 요약 */}
      <ReservationStats
        todayCount={stats.today}
        pendingCount={stats.pending}
        confirmedCompletedCount={stats.confirmedCompleted}
        onTodayClick={handleTodayClick}
        onPendingClick={handlePendingClick}
        onConfirmedClick={handleConfirmedClick}
      />

      {/* 검색 및 필터 */}
      <ReservationFilters
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        searchQuery={searchQuery}
        onStatusFilterChange={setStatusFilter}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        onSearchKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />

      {/* 예약 목록 */}
      <div className="bg-card border-t border-b rounded-none">
        {reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              조건에 맞는 예약이 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              검색 조건을 변경해 보세요
            </p>
          </div>
        ) : (
          <div>
            {reservations.map((reservation, index) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusUpdate={handleReservationUpdate}
                isLast={index === reservations.length - 1}
              />
            ))}
            
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
          </div>
        )}
      </div>
    </div>
  );
}
