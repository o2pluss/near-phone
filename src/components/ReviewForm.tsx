import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Star } from "lucide-react";
import type { ReviewFormData } from "../types/review";
import { formatPrice } from "../utils/formatPrice";
import { getProductDisplayName } from "../utils/productDisplay";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  reservation: {
    id: string;
    storeName: string;
    storeAddress: string;
    model: string;
    price: number;
    storage?: string;
    productCarrier?: string;
    productSnapshot?: {
      model?: string;
      storage?: string;
      carrier?: string;
    };
  };
  isSubmitting?: boolean;
}

export default function ReviewForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reservation,
  isSubmitting = false 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (content.trim().length < 10) {
      alert("리뷰는 최소 10자 이상 작성해주세요.");
      return;
    }
    
    onSubmit({ rating, content: content.trim() });
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setContent("");
    onClose();
  };

  const formatPriceDisplay = (price: number) => {
    return formatPrice(price);
  };



  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          className={`h-8 w-8 cursor-pointer transition-colors ${
            starValue <= (hoveredRating || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "매우 불만족";
      case 2: return "불만족";
      case 3: return "보통";
      case 4: return "만족";
      case 5: return "매우 만족";
      default: return "별점을 선택해주세요";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>리뷰 작성</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 예약 정보 */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div>
              <span className="font-medium">{reservation.storeName}</span>
            </div>
            <div>
              <span className="text-sm">{getProductDisplayName(reservation)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{formatPriceDisplay(reservation.price)}</span>
              </div>
            </div>
          </div>

          {/* 별점 선택 */}
          <div className="space-y-3">
            <Label>서비스는 어떠셨나요?</Label>
            <div className="flex items-center justify-center space-x-1 py-4">
              {renderStars()}
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* 리뷰 내용 */}
          <div className="space-y-2">
            <Label htmlFor="content">
              리뷰를 작성해주세요 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="매장 서비스, 직원 친절도, 가격 만족도 등에 대한 솔직한 후기를 남겨주세요. (최소 10자)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>최소 10자 이상</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              취소
            </Button>
            <Button 
              type="submit"
              disabled={rating === 0 || content.trim().length < 10 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "등록 중..." : "리뷰 등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}