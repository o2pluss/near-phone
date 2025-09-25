import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  MoreVertical,
} from "lucide-react";
import { getStatusInfo, convertReservationToStoreData } from "../../utils/reservationUtils";
import { formatPrice } from "../../utils/formatPrice";
import { getReservationProductDisplay, getDeletedProductStyles } from "../../utils/productDisplay";
import { ProductStatusBadge } from "../ui/ProductStatusBadge";
import type { Reservation } from "../../types/reservation";

interface TimelineItemProps {
  reservation: Reservation;
  onStoreSelect?: (store: any) => void;
  onCancel?: (reservation: Reservation) => void;
  onWriteReview?: (reservation: Reservation) => void;
  isLast?: boolean;
}

export default function TimelineItem({
  reservation,
  onStoreSelect,
  onCancel,
  onWriteReview,
  isLast = false,
}: TimelineItemProps) {
  const statusInfo = getStatusInfo(reservation.status);
  const canCancel =
    reservation.status === "confirmed" ||
    reservation.status === "pending";
  const canReview = reservation.status === "completed";
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 상품 표시 정보 생성
  const productDisplay = getReservationProductDisplay(reservation);
  const deletedStyles = getDeletedProductStyles();

  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭 시에는 카드 클릭 이벤트 무시
    if (
      e.target !== e.currentTarget &&
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }

    if (onStoreSelect) {
      const storeData = convertReservationToStoreData(reservation);
      onStoreSelect(storeData);
    }
  };

  const handleCancelRequest = () => {
    if (onCancel) {
      onCancel(reservation);
    }
    setShowDropdown(false);
  };

  const handleReviewRequest = () => {
    if (onWriteReview) {
      onWriteReview(reservation);
    }
  };

  return (
    <div className="relative pb-1">
      {/* Timeline Line */}
      <div className="absolute left-1.5 top-6 w-0.5 h-full bg-gray-200"></div>

      {/* Timeline Icon, Store Name and Actions Row */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
          <h4 className="font-semibold text-lg text-foreground ml-3">
            {reservation.storeName}
          </h4>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {canCancel && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md"
                    onClick={handleCancelRequest}
                  >
                    예약 취소
                  </button>
                </div>
              )}
            </div>
          )}

          {canReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReviewRequest}
              className="text-sm"
            >
              리뷰 쓰기
            </Button>
          )}
        </div>
      </div>

      {/* Reservation Card */}
      <div className="ml-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-none" onClick={handleCardClick}>
          <CardContent className="p-4">
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-3">
              <Badge
                variant={statusInfo.variant}
                className="flex items-center"
              >
                <span>{statusInfo.label}</span>
              </Badge>
              <div className="text-right text-sm text-muted-foreground">
                {reservation.date} {reservation.time}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{productDisplay.name || productDisplay.model}</span>
                    {productDisplay.isDeleted && (
                      <ProductStatusBadge
                        productInfo={productDisplay}
                        size="sm"
                        showIcon={false}
                      />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.storage}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {formatPrice(reservation.price)}
                  </div>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>

        {!isLast && <div className="h-6"></div>}
      </div>
    </div>
  );
}