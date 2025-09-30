import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import TimelineGroup from "./TimelineGroup";
import type { ReservationGroupedByDate, Reservation } from "../../types/reservation";

interface ReservationTabContentProps {
  groupedReservations: ReservationGroupedByDate[];
  tabType: "upcoming" | "past";
  onStoreSelect?: (store: any) => void;
  onCancel?: (reservation: Reservation) => void;
  onWriteReview?: (reservation: Reservation) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function ReservationTabContent({
  groupedReservations,
  tabType,
  onStoreSelect,
  onCancel,
  onWriteReview,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ReservationTabContentProps) {
  const router = useRouter();
  if (groupedReservations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center pt-6">
          {tabType === "upcoming" ? (
            <>
              <h3 className="text-lg font-semibold mb-2">
                예정된 예약이 없습니다
              </h3>
              <p className="text-muted-foreground mb-4">
                새로운 매장을 예약해보세요
              </p>
              <Button onClick={() => router.push('/search')}>매장 찾기</Button>
            </>
          ) : (
            <>
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
      
      {/* 무한 스크롤 버튼 */}
      {hasNextPage && onLoadMore && (
        <div className="flex justify-center py-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
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
  );
}