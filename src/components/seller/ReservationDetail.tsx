import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ChevronLeft } from "lucide-react";
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

interface ReservationDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancel_pending" | "cancelled";
  carrier: string; // 통신사
  conditions: {
    numberPorting: boolean; // 번호이동
    newSubscription: boolean; // 신규가입
    deviceChange: boolean; // 기기변경
    cardDiscount: boolean; // 카드 할인
    bundleDiscount: boolean; // 결합 할인
    requiredPlan: string; // 필수 요금제
    additionalServices: string[]; // 부가서비스
  };
  requestedAt: string; // 예약 요청일
  confirmedAt?: string; // 예약 승인일
  cancelRequestedAt?: string; // 취소 요청일
  cancelledAt?: string; // 취소 승인일
  createdAt: string;
}

interface ReservationDetailProps {
  reservation: ReservationDetail;
  onBack: () => void;
  onStatusUpdate: (reservationId: string, status: ReservationDetail["status"]) => void;
}

// 날짜 형식 변환 함수 (YYYY-MM-DD → YYYY.MM.DD)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 날짜와 시간 형식 변환 함수
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const getStatusInfo = (status: ReservationDetail["status"]) => {
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
  reservation: ReservationDetail,
  onStatusUpdate: (reservationId: string, status: ReservationDetail["status"]) => void
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
                예약일시: {formatDate(reservation.date)} {reservation.time}
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
                예약일시: {formatDate(reservation.date)} {reservation.time}
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
                예약일시: {formatDate(reservation.date)} {reservation.time}
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
                예약일시: {formatDate(reservation.date)} {reservation.time}
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
                예약일시: {formatDate(reservation.date)} {reservation.time}
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

export default function ReservationDetail({ reservation, onBack, onStatusUpdate }: ReservationDetailProps) {
  const statusInfo = getStatusInfo(reservation.status);
  const actionButtons = getActionButtons(reservation, onStatusUpdate);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">예약 상세</h2>
        </div>
        {actionButtons.length > 0 && (
          <div className="flex space-x-2">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">기본 정보</h3>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">고객명</span>
                <span>{reservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span>{reservation.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예약일시</span>
                <span>{formatDate(reservation.date)} {reservation.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">모델명</span>
                <span className="font-medium">{reservation.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가격</span>
                <span className="font-semibold">{reservation.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">통신사</span>
                <span>{reservation.carrier}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 조건 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium">조건 정보</h3>
            
            <div className="flex flex-wrap gap-2">
              {reservation.conditions.numberPorting && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">번호이동</span>
              )}
              {reservation.conditions.newSubscription && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">신규가입</span>
              )}
              {reservation.conditions.deviceChange && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">기기변경</span>
              )}
              {reservation.conditions.cardDiscount && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">카드 할인</span>
              )}
              {reservation.conditions.bundleDiscount && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">결합 할인</span>
              )}
              {reservation.conditions.requiredPlan && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">필수 요금제</span>
              )}
              {reservation.conditions.additionalServices.length > 0 && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm">부가서비스</span>
              )}
            </div>
          </div>

          <Separator />

          {/* 처리 내역 */}
          <div className="space-y-4">
            <h3 className="font-medium">처리 내역</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">예약 요청일</span>
                <span>{formatDateTime(reservation.requestedAt)}</span>
              </div>
              
              {reservation.confirmedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예약 승인일</span>
                  <span>{formatDateTime(reservation.confirmedAt)}</span>
                </div>
              )}
              
              {reservation.cancelRequestedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">취소 요청일</span>
                  <span>{formatDateTime(reservation.cancelRequestedAt)}</span>
                </div>
              )}
              
              {reservation.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">취소 승인일</span>
                  <span>{formatDateTime(reservation.cancelledAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}