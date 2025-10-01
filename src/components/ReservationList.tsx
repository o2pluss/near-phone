import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import ReservationListHeader from "./reservation/ReservationListHeader";
import ReservationTabContent from "./reservation/ReservationTabContent";
import ReservationDialogs from "./reservation/ReservationDialogs";
import { useReservationList, useUpdateReservationStatus, useCancelReservation } from "../hooks/useReservationList";
import {
  filterReservationsByStatus,
  groupReservationsByDate,
} from "../utils/reservationUtils";
import { transformApiReservationsToReservations } from "../utils/reservationDataTransform";
import type { Reservation, ReservationListProps } from "../types/reservation";
import type { ReviewFormData } from "../types/review";

export default function ReservationList({
  onStoreSelect,
  currentTab = "upcoming",
  onTabChange,
}: ReservationListProps = {}) {
  // 기간별 조회 상태
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // API 훅 사용 (페이지네이션 지원)
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useReservationList({
    limit: 15, // 기본 페이지 크기
    startDate: appliedStartDate,
    endDate: appliedEndDate
  });

  const updateReservationStatus = useUpdateReservationStatus();
  const cancelReservation = useCancelReservation();
  
  // 모든 페이지의 데이터를 합쳐서 Reservation 타입으로 변환
  const allApiReservations = data?.pages.flatMap(page => page.items) || [];
  const reservations = transformApiReservationsToReservations(allApiReservations);
  
  // 디버깅을 위한 로그
  console.log('API reservations:', allApiReservations);
  
  // 변환된 예약 데이터 로그
  console.log('Transformed reservations:', reservations);
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewReservation, setReviewReservation] = useState<Reservation | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // 예약 취소 처리
  const handleCancelReservation = async (reservationId: string) => {
    try {
      const reservation = selectedReservation;
      if (!reservation) return;

      if (reservation.status === "pending") {
        await updateReservationStatus.mutateAsync({
          reservationId: reservation.id,
          status: "cancelled"
        });
      } else if (reservation.status === "confirmed") {
        await updateReservationStatus.mutateAsync({
          reservationId: reservation.id,
          status: "cancel_pending"
        });
      }
      
      setShowCancelDialog(false);
      setSelectedReservation(null);
    } catch (error) {
      alert('예약 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelAction = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  // 리뷰 작성 처리
  const handleWriteReview = (reservation: Reservation) => {
    setReviewReservation(reservation);
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async (data: ReviewFormData) => {
    if (!reviewReservation) return;

    setReviewSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("리뷰 제출:", {
        reservationId: reviewReservation.id,
        storeId: reviewReservation.storeId,
        storeName: reviewReservation.storeName,
        model: reviewReservation.model,
        price: reviewReservation.price,
        rating: data.rating,
        content: data.content
      });

      alert("리뷰가 성공적으로 등록되었습니다!");
      setShowReviewForm(false);
      setReviewReservation(null);
    } catch (error) {
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // 날짜 필터 처리
  const handleDateSearch = () => {
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
  };

  const handleDateFilterReset = () => {
    setTempStartDate("");
    setTempEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  // 예약 데이터 필터링 및 그룹화 (서버에서 이미 날짜 필터링됨)
  const upcomingReservations = filterReservationsByStatus(reservations, "upcoming");
  const pastReservations = filterReservationsByStatus(reservations, "past");

  const upcomingGrouped = groupReservationsByDate(upcomingReservations);
  const pastGrouped = groupReservationsByDate(pastReservations);

  const totalFilteredCount = upcomingReservations.length + pastReservations.length;

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 space-y-6">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">예약 목록을 불러오는 중...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 space-y-6">
            <div className="text-center py-12">
              <div className="text-lg text-red-600">예약 목록을 불러올 수 없습니다.</div>
              <div className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-6">
          <ReservationListHeader
            totalReservations={reservations.length}
            filteredCount={totalFilteredCount}
            showDateFilter={showDateFilter}
            onToggleDateFilter={() => setShowDateFilter(!showDateFilter)}
            tempStartDate={tempStartDate}
            tempEndDate={tempEndDate}
            onTempStartDateChange={setTempStartDate}
            onTempEndDateChange={setTempEndDate}
            appliedStartDate={appliedStartDate}
            appliedEndDate={appliedEndDate}
            onDateSearch={handleDateSearch}
            onDateFilterReset={handleDateFilterReset}
          />

          <Tabs
            value={currentTab}
            onValueChange={(v) => onTabChange?.(v as "upcoming" | "past")}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                예정된 예약 ({upcomingReservations.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                지난 예약 ({pastReservations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              <ReservationTabContent
                groupedReservations={upcomingGrouped}
                tabType="upcoming"
                onStoreSelect={onStoreSelect}
                onCancel={handleCancelAction}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              <ReservationTabContent
                groupedReservations={pastGrouped}
                tabType="past"
                onStoreSelect={onStoreSelect}
                onWriteReview={handleWriteReview}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </TabsContent>
          </Tabs>

          <ReservationDialogs
            showCancelDialog={showCancelDialog}
            selectedReservation={selectedReservation}
            onCancelDialogChange={setShowCancelDialog}
            onConfirmCancel={handleCancelReservation}
            showReviewForm={showReviewForm}
            reviewReservation={reviewReservation}
            reviewSubmitting={reviewSubmitting}
            onReviewDialogChange={(open) => {
              setShowReviewForm(open);
              if (!open) setReviewReservation(null);
            }}
            onReviewSubmit={handleReviewSubmit}
          />
        </div>
      </div>
    </div>
  );
}