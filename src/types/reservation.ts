export interface Reservation {
  id: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  date: string;
  time: string;
  model: string;
  price: number;
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "cancel_pending";
  createdAt: string;
  conditions: string[];
  // 상품별 통신사 정보
  productCarrier: "kt" | "skt" | "lgu";
  // 용량 정보
  storage: string;
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
}

export interface ReservationListProps {
  onStoreSelect?: (store: any) => void;
  currentTab?: "upcoming" | "past";
  onTabChange?: (tab: "upcoming" | "past") => void;
}

export interface ReservationStatusInfo {
  label: string;
  color: string;
  variant: "default" | "secondary" | "outline" | "destructive";
}

export interface ReservationGroupedByDate {
  date: string;
  reservations: Reservation[];
}