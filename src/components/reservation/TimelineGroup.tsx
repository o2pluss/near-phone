import React from "react";
import TimelineItem from "./TimelineItem";
import { formatDateHeader } from "../../utils/reservationUtils";
import type { Reservation } from "../../types/reservation";

interface TimelineGroupProps {
  date: string;
  reservations: Reservation[];
  onStoreSelect?: (store: any) => void;
  onCancel?: (reservation: Reservation) => void;
  onWriteReview?: (reservation: Reservation) => void;
  isLast?: boolean;
}

export default function TimelineGroup({
  date,
  reservations,
  onStoreSelect,
  onCancel,
  onWriteReview,
  isLast = false,
}: TimelineGroupProps) {
  return (
    <div className="relative">
      {/* Date Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {formatDateHeader(date)}
        </h3>
      </div>

      {/* Timeline Items */}
      <div className="relative">
        {reservations.map((reservation, index) => (
          <TimelineItem
            key={reservation.id}
            reservation={reservation}
            onStoreSelect={onStoreSelect}
            onCancel={onCancel}
            onWriteReview={onWriteReview}
            isLast={index === reservations.length - 1 && isLast}
          />
        ))}
      </div>
    </div>
  );
}