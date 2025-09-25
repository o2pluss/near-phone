"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface ReservationSuccessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReservationSuccessDialog({
  isOpen,
  onOpenChange,
}: ReservationSuccessDialogProps) {
  const router = useRouter();

  const handleViewReservations = () => {
    onOpenChange(false);
    router.push('/reservations');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-green-600">
            예약 신청 완료!
          </DialogTitle>
          <DialogDescription className="text-center">
            예약 신청이 완료되었습니다.
            <br />
            매장에서 승인 후 예약이 확정됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            닫기
          </Button>
          <Button
            onClick={handleViewReservations}
            className="flex-1"
          >
            예약 보기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
