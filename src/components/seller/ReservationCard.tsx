import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
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
} from "../ui/alert-dialog";

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

interface ReservationCardProps {
  reservation: Reservation;
  onStatusUpdate: (reservationId: string, status: Reservation["status"]) => void;
  onReservationDetail?: (reservation: any) => void;
  isLast?: boolean;
}

// 날짜 형식 변환 함수 (YYYY-MM-DD → YY.MM.DD)
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getStatusInfo = (status: Reservation["status"]) => {
  switch (status) {
    case "pending":
      return {
        label: "대기",
        variant: "secondary" as const,
      };
    case "confirmed":
      return {
        label: "예약 확정",
        variant: "default" as const,
      };
    case "completed":
      return {
        label: "종료",
        variant: "secondary" as const,
      };
    case "cancel_pending":
      return {
        label: "취소중",
        variant: "outline" as const,
      };
    case "cancelled":
      return {
        label: "취소",
        variant: "destructive" as const,
      };
  }
};

const getActionButtons = (
  reservation: Reservation,
  onStatusUpdate: (reservationId: string, status: Reservation["status"]) => void
) => {
  const buttons = [];
  
  switch (reservation.status) {
    case "pending":
      buttons.push(
        <AlertDialog key="accept">
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300"
            >
              수락
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 수락</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 수락하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "confirmed")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                수락하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      buttons.push(
        <AlertDialog key="reject">
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300"
            >
              거절
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 거절</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 거절하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  거절한 예약은 되돌릴 수 없습니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "cancelled")}
                className="bg-rose-600 hover:bg-rose-700"
              >
                거절하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      break;
    case "confirmed":
      buttons.push(
        <AlertDialog key="complete">
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300"
            >
              완료
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 완료</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 완료 처리하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  완료된 예약은 되돌릴 수 없습니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "completed")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                완료 처리
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      break;
    case "cancel_pending":
      buttons.push(
        <AlertDialog key="approve_cancel">
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-300"
            >
              취소 승인
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>취소 승인</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약 취소 요청을 승인하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  승인된 취소는 되돌릴 수 없습니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "cancelled")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                취소 승인
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      buttons.push(
        <AlertDialog key="reject_cancel">
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300"
            >
              취소 거절
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>취소 거절</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약 취소 요청을 거절하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  취소 거절 시 예약이 다시 확정 상태로 돌아갑니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "confirmed")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                취소 거절
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      break;
    case "completed":
    case "cancelled":
      // 완료되거나 취소된 예약은 버튼 없음
      break;
  }
  
  return buttons;
};

export default function ReservationCard({ reservation, onStatusUpdate, onReservationDetail, isLast = false }: ReservationCardProps) {
  
  // Mock data for reservation detail - 실제로는 API에서 가져올 데이터
  const createDetailReservation = (baseReservation: Reservation) => ({
    ...baseReservation,
    carrier: "SKT", // 통신사
    conditions: {
      numberPorting: true, // 번호이동
      newSubscription: false, // 신규가입
      deviceChange: false, // 기기변경
      cardDiscount: true, // 카드 할인
      bundleDiscount: false, // 결합 할인
      requiredPlan: "5G 프리미엄 요금제", // 필수 요금제
      additionalServices: ["보험가입", "액세서리"], // 부가서비스
    },
    requestedAt: baseReservation.createdAt, // 예약 요청일
    confirmedAt: baseReservation.status === "confirmed" || baseReservation.status === "completed" 
      ? "2025-01-21T09:30:00" : undefined, // 예약 승인일
    cancelRequestedAt: baseReservation.status === "cancel_pending" || baseReservation.status === "cancelled" 
      ? "2025-01-21T11:00:00" : undefined, // 취소 요청일
    cancelledAt: baseReservation.status === "cancelled" 
      ? "2025-01-21T11:30:00" : undefined, // 취소 승인일
  });

  const handleCardClick = () => {
    if (onReservationDetail) {
      const detailReservation = createDetailReservation(reservation);
      onReservationDetail(detailReservation);
    }
  };
  return (
    <div className="bg-card">
      <div 
        className="p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleCardClick}
      >
        {/* 1행: 예약일시 + 처리 버튼 */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {formatDateShort(reservation.date)} {reservation.time}
          </div>
          <div 
            className="flex space-x-2"
            onClick={(e) => e.stopPropagation()} // 버튼 클릭 시 카드 클릭 이벤트 방지
          >
            {getActionButtons(reservation, onStatusUpdate)}
          </div>
        </div>
        
        {/* 2행: 예약 상태 + 고객명 + 연락처 */}
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusInfo(reservation.status).variant}>
            {getStatusInfo(reservation.status).label}
          </Badge>
          <span className="text-sm">
            {reservation.customerName} · {reservation.customerPhone}
          </span>
        </div>
        
        {/* 3행: 모델명 + 가격 */}
        <div className="flex justify-between items-center">
          <div className="font-medium">
            {reservation.model}
          </div>
          <div className="font-semibold">
            {reservation.price.toLocaleString()}원
          </div>
        </div>
      </div>
      {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
      {!isLast && <Separator />}
    </div>
  );
}