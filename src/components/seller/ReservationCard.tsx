"use client";

import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import Link from "next/link";
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
import type { Reservation } from "../../types/reservation";
import { getStatusInfo } from "../../utils/reservationUtils";

interface ReservationCardProps {
  reservation: Reservation;
  onStatusUpdate: (reservationId: string, status: Reservation["status"]) => void;
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
              승인
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 승인</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 승인하시겠습니까?
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
              종료
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>예약 종료</AlertDialogTitle>
              <AlertDialogDescription>
                {reservation.customerName}님의 {reservation.model} 예약을 종료 처리하시겠습니까?
                <br />
                예약일시: {formatDateShort(reservation.date)} {reservation.time}
                <br />
                <span className="text-sm text-muted-foreground mt-2 block">
                  종료된 예약은 되돌릴 수 없습니다.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onStatusUpdate(reservation.id, "completed")}
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
      // 종료되거나 취소된 예약은 버튼 없음
      break;
  }
  
  return buttons;
};

export default function ReservationCard({ reservation, onStatusUpdate, isLast = false }: ReservationCardProps) {
  const statusInfo = getStatusInfo(reservation.status);
  
  return (
    <div className="bg-card">
      <div className="p-4 space-y-3">
        {/* 1행: 예약일시 + 처리 버튼 */}
        <div className="flex justify-between items-center">
          <Link 
            href={`/seller/reservations/${reservation.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {formatDateShort(reservation.date)} {reservation.time}
          </Link>
          <div className="flex space-x-2">
            {getActionButtons(reservation, onStatusUpdate)}
          </div>
        </div>
        
        {/* 2행: 예약 상태 + 고객명 + 연락처 */}
        <Link 
          href={`/seller/reservations/${reservation.id}`}
          className="flex items-center space-x-2 hover:bg-muted/50 transition-colors cursor-pointer p-2 -m-2 rounded"
        >
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
          <span className="text-sm">
            {reservation.customerName} · {reservation.customerPhone}
          </span>
        </Link>
        
        {/* 3행: 모델명 + 가격 */}
        <Link 
          href={`/seller/reservations/${reservation.id}`}
          className="flex justify-between items-center hover:bg-muted/50 transition-colors cursor-pointer p-2 -m-2 rounded"
        >
          <div className="font-medium">
            {reservation.model}
          </div>
          <div className="font-semibold">
            {reservation.price.toLocaleString()}원
          </div>
        </Link>
      </div>
      {/* 마지막 아이템이 아닌 경우에만 구분선 표시 */}
      {!isLast && <Separator />}
    </div>
  );
}