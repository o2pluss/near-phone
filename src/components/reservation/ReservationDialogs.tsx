import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import ReviewForm from "../ReviewForm";
import type { ReviewFormData } from "../../types/review";
import type { Reservation } from "../../types/reservation";

interface ReservationDialogsProps {
  // Cancel Dialog
  showCancelDialog: boolean;
  selectedReservation: Reservation | null;
  onCancelDialogChange: (open: boolean) => void;
  onConfirmCancel: (reservationId: string) => void;
  
  // Review Dialog
  showReviewForm: boolean;
  reviewReservation: Reservation | null;
  reviewSubmitting: boolean;
  onReviewDialogChange: (open: boolean) => void;
  onReviewSubmit: (data: ReviewFormData) => Promise<void>;
}

export default function ReservationDialogs({
  showCancelDialog,
  selectedReservation,
  onCancelDialogChange,
  onConfirmCancel,
  showReviewForm,
  reviewReservation,
  reviewSubmitting,
  onReviewDialogChange,
  onReviewSubmit,
}: ReservationDialogsProps) {
  return (
    <>
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={onCancelDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 취소</DialogTitle>
            <DialogDescription>
              정말로 예약을 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  상품
                </span>
                <span className="font-medium">
                  {selectedReservation.model} ·{" "}
                  {selectedReservation.storage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  날짜/시간
                </span>
                <span className="font-medium">
                  {selectedReservation.date}{" "}
                  {selectedReservation.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  매장
                </span>
                <span className="font-medium">
                  {selectedReservation.storeName}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onCancelDialogChange(false)}
            >
              돌아가기
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedReservation &&
                onConfirmCancel(selectedReservation.id)
              }
            >
              예약 취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Form Dialog */}
      {reviewReservation && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => onReviewDialogChange(false)}
          onSubmit={onReviewSubmit}
          reservation={{
            id: reviewReservation.id,
            storeName: reviewReservation.storeName,
            storeAddress: reviewReservation.storeAddress,
            model: reviewReservation.model,
            price: reviewReservation.price,
            storage: reviewReservation.storage,
            productCarrier: reviewReservation.productCarrier,
            productSnapshot: reviewReservation.productSnapshot
          }}
          isSubmitting={reviewSubmitting}
        />
      )}
    </>
  );
}