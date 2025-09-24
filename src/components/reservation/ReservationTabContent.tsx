import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Clock } from "lucide-react";
import TimelineGroup from "./TimelineGroup";
import type { ReservationGroupedByDate, Reservation } from "../../types/reservation";

interface ReservationTabContentProps {
  groupedReservations: ReservationGroupedByDate[];
  tabType: "upcoming" | "past";
  onStoreSelect?: (store: any) => void;
  onCancel?: (reservation: Reservation) => void;
  onWriteReview?: (reservation: Reservation) => void;
}

export default function ReservationTabContent({
  groupedReservations,
  tabType,
  onStoreSelect,
  onCancel,
  onWriteReview,
}: ReservationTabContentProps) {
  if (groupedReservations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          {tabType === "upcoming" ? (
            <>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                예정된 예약이 없습니다
              </h3>
              <p className="text-muted-foreground mb-4">
                새로운 매장을 예약해보세요
              </p>
              <Button>매장 찾기</Button>
            </>
          ) : (
            <>
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                지난 예약 내역이 없습니다
              </h3>
              <p className="text-muted-foreground">
                예약 후 내역을 확인할 수 있습니다
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {groupedReservations.map((group, groupIndex) => (
        <TimelineGroup
          key={group.date}
          date={group.date}
          reservations={group.reservations}
          onStoreSelect={onStoreSelect}
          onCancel={onCancel}
          onWriteReview={onWriteReview}
          isLast={groupIndex === groupedReservations.length - 1}
        />
      ))}
    </div>
  );
}