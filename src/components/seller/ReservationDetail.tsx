"use client";

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
import { useReservationDetail, useUpdateReservationStatus } from "../../hooks/useReservationList";
import { useQueryClient } from "@tanstack/react-query";
import { transformApiReservationToReservation } from "../../utils/reservationDataTransform";
import { getStatusInfo } from "../../utils/reservationUtils";
import type { Reservation } from "../../types/reservation";

interface ReservationDetailProps {
  reservationId: string;
  onBack: () => void;
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


const getActionButtons = (
  reservation: Reservation,
  onStatusUpdate: (status: Reservation["status"]) => Promise<void>
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
              승인
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 승인</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 승인하시겠습니까?
                <br />
                예약일시: {formatDate(reservation.date)} {reservation.time}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate("confirmed")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                승인하기
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
                onClick={() => onStatusUpdate("cancelled")}
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
              종료
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 종료</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 종료 처리하시겠습니까?
                <br />
                예약일시: {formatDate(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  종료된 예약은 되돌릴 수 없습니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate("completed")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                종료 처리
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
                onClick={() => onStatusUpdate("cancelled")}
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
                onClick={() => onStatusUpdate("confirmed")}
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
      // 종료되거나 취소된 예약은 버튼 없음
      break;
  }
  
  return buttons;
};

export default function ReservationDetail({ reservationId, onBack }: ReservationDetailProps) {
  const { data: apiReservation, isLoading, error } = useReservationDetail(reservationId);
  const updateReservationStatus = useUpdateReservationStatus();
  const queryClient = useQueryClient();

  const handleStatusUpdate = async (newStatus: Reservation["status"]) => {
    try {
      await updateReservationStatus.mutateAsync({
        reservationId,
        status: newStatus,
      });
      
      // 캐시 무효화로 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", reservationId] });
      
      console.log('예약 상태 업데이트 성공');
    } catch (error) {
      console.error('예약 상태 업데이트 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !apiReservation) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">예약 정보를 불러올 수 없습니다.</p>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  // API 데이터를 Reservation 타입으로 변환
  const reservation = transformApiReservationToReservation(apiReservation);

  const statusInfo = getStatusInfo(reservation.status);
  const actionButtons = getActionButtons(reservation, handleStatusUpdate);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
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
                <span className="font-medium">{reservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span className="font-medium">{reservation.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예약일시</span>
                <span>{formatDate(reservation.date)} {reservation.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">모델명</span>
                <span>{reservation.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가격</span>
                <span>{reservation.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">용량</span>
                <span>{reservation.productSnapshot?.storage.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">통신사</span>
                <span>{reservation.productCarrier.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 조건 정보 */}
          <div className="space-y-4">
            <h3 className="font-medium">조건 정보</h3>
            
            <div className="flex flex-wrap gap-2">
              {reservation.conditions && reservation.conditions.length > 0 ? (
                reservation.conditions.map((condition, index) => (
                  <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                    {condition}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">조건 정보 없음</span>
              )}
            </div>
          </div>

          <Separator />

          {/* 처리 내역 */}
          <div className="space-y-4">
            <h3 className="font-medium">처리 내역</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">예약 생성일</span>
                <span>{formatDateTime(reservation.createdAt)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">마지막 수정일</span>
                <span>{formatDateTime(reservation.updatedAt || reservation.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}