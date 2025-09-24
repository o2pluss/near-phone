export interface Review {
  id: string;
  reservationId: string; // 연관된 예약 ID
  rating: number; // 1-5 별점
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// 사용자 화면에서 사용하는 확장된 리뷰 인터페이스
export interface ReviewWithUser extends Review {
  userId: string;
  userName: string; // 카카오 닉네임
  storeId?: string;
  storeName?: string;
  userPhone?: string;
}

// 예약과 함께 사용되는 확장된 리뷰 인터페이스
export interface ReservationWithReview {
  // 예약 정보
  id: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  userId: string;
  customerName: string; // 카카오 닉네임
  customerPhone: string; // 카카오 휴대폰 번호
  date: string;
  time: string;
  model: string; // 예약한 모델
  storage?: string;
  productCarrier?: 'kt' | 'skt' | 'lgu';
  price: number; // 예약 시 적용된 상품 금액
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'cancel_pending';
  createdAt: string;
  conditions: string[];
  
  // 상품 스냅샷 (예약 당시 정보 보존)
  productSnapshot?: {
    id: string;
    name: string;
    model: string;
    storage: string;
    price: number;
    carrier: string;
    conditions: string[];
    isDeleted: boolean;
    deletedAt?: string;
    deletionReason?: string;
  };
  
  // 매장 스냅샷 (예약 당시 정보 보존)
  storeSnapshot?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  
  // 리뷰 정보 (완료된 예약에만 있을 수 있음)
  review?: Review;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewFormData {
  rating: number;
  content: string;
}