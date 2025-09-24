import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import ReservationListHeader from "./reservation/ReservationListHeader";
import ReservationTabContent from "./reservation/ReservationTabContent";
import ReservationDialogs from "./reservation/ReservationDialogs";
import { mockReservations } from "../data/mockReservations";
import {
  filterReservationsByStatus,
  filterByDateRange,
  groupReservationsByDate,
} from "../utils/reservationUtils";
import type { Reservation, ReservationListProps } from "../types/reservation";
import type { ReviewFormData } from "../types/review";

export default function ReservationList({
  onStoreSelect,
  currentTab = "upcoming",
  onTabChange,
}: ReservationListProps = {}) {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewReservation, setReviewReservation] = useState<Reservation | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  
  // 기간별 조회 상태
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // 예약 취소 처리
  const handleCancelReservation = (reservationId: string) => {
    setReservations(
      reservations.map((res) =>
        res.id === reservationId
          ? { ...res, status: "cancel_pending" as const }
          : res,
      ),
    );
    setShowCancelDialog(false);
    setSelectedReservation(null);
  };

  const handleCancelAction = (reservation: Reservation) => {
    if (reservation.status === "pending") {
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservation.id
            ? { ...res, status: "cancelled" as const }
            : res,
        ),
      );
    } else if (reservation.status === "confirmed") {
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservation.id
            ? { ...res, status: "cancel_pending" as const }
            : res,
        ),
      );
    }
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

  // 예약 데이터 필터링 및 그룹화
  const allUpcomingReservations = filterReservationsByStatus(reservations, "upcoming");
  const allPastReservations = filterReservationsByStatus(reservations, "past");

  const upcomingReservations = filterByDateRange(
    allUpcomingReservations,
    appliedStartDate,
    appliedEndDate
  );
  const pastReservations = filterByDateRange(
    allPastReservations,
    appliedStartDate,
    appliedEndDate
  );

  const upcomingGrouped = groupReservationsByDate(upcomingReservations);
  const pastGrouped = groupReservationsByDate(pastReservations);

  const totalFilteredCount = upcomingReservations.length + pastReservations.length;

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
              />
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              <ReservationTabContent
                groupedReservations={pastGrouped}
                tabType="past"
                onStoreSelect={onStoreSelect}
                onWriteReview={handleWriteReview}
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