import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Users, CalendarDays } from "lucide-react";
import ReservationStats from "./ReservationStats";
import ReservationFilters from "./ReservationFilters";
import ReservationCard from "./ReservationCard";

interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancel_pending" | "cancelled";
  createdAt: string;
}

interface ReservationManagementProps {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  todayStats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  pendingCount: number;
  statusFilter: "all" | Reservation["status"];
  startDate: string;
  endDate: string;
  searchQuery: string;
  onStatusFilterChange: (value: "all" | Reservation["status"]) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onResetFilters: () => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
  onReservationUpdate: (reservationId: string, status: Reservation["status"]) => void;
  onTodayClick: () => void;
  onPendingClick: () => void;
  onConfirmedClick: () => void;
  onScheduleView?: () => void;
  onReservationDetail?: (reservation: any) => void;
}

export default function ReservationManagement({
  reservations,
  filteredReservations,
  todayStats,
  pendingCount,
  statusFilter,
  startDate,
  endDate,
  searchQuery,
  onStatusFilterChange,
  onStartDateChange,
  onEndDateChange,
  onSearchQueryChange,
  onSearch,
  onResetFilters,
  onSearchKeyPress,
  onReservationUpdate,
  onTodayClick,
  onPendingClick,
  onConfirmedClick,
  onScheduleView,
  onReservationDetail,
}: ReservationManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          예약 관리 ({reservations.length})
        </h3>
        {onScheduleView && (
          <Button 
            variant="outline" 
            onClick={onScheduleView}
            className="flex items-center space-x-2"
          >
            <CalendarDays className="h-4 w-4" />
            <span>스케줄 보기</span>
          </Button>
        )}
      </div>

      {/* 당일 예약 요약 */}
      <ReservationStats
        todayStats={todayStats}
        pendingCount={pendingCount}
        onTodayClick={onTodayClick}
        onPendingClick={onPendingClick}
        onConfirmedClick={onConfirmedClick}
      />

      {/* 검색 및 필터 */}
      <ReservationFilters
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        searchQuery={searchQuery}
        onStatusFilterChange={onStatusFilterChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        onReset={onResetFilters}
        onSearchKeyPress={onSearchKeyPress}
      />

      {/* 예약 목록 */}
      <div className="bg-card border-t border-b rounded-none">
        {filteredReservations.length === 0 ? (
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
            {filteredReservations.map((reservation, index) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusUpdate={onReservationUpdate}
                onReservationDetail={onReservationDetail}
                isLast={index === filteredReservations.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}