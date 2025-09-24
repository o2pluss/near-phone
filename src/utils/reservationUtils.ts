import type { Reservation, ReservationStatusInfo, ReservationGroupedByDate } from "../types/reservation";

// 예약 상태 정보를 반환하는 함수
export const getStatusInfo = (status: Reservation["status"]): ReservationStatusInfo => {
  switch (status) {
    case "pending":
      return {
        label: "대기",
        color: "bg-yellow-500",
        variant: "secondary" as const,
      };
    case "confirmed":
      return {
        label: "예약 확정",
        color: "bg-green-500",
        variant: "default" as const,
      };
    case "completed":
      return {
        label: "완료",
        color: "bg-blue-500",
        variant: "secondary" as const,
      };
    case "cancelled":
      return {
        label: "취소",
        color: "bg-gray-500",
        variant: "outline" as const,
      };
    case "cancel_pending":
      return {
        label: "취소중",
        color: "bg-orange-500",
        variant: "destructive" as const,
      };
    default:
      return {
        label: "알 수 없음",
        color: "bg-gray-500",
        variant: "outline" as const,
      };
  }
};

// 날짜를 한국어로 포맷팅하는 함수
export const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];

  return `${month}.${day} ${weekday}`;
};

// 예약들을 날짜별로 그룹화하는 함수
export const groupReservationsByDate = (
  reservations: Reservation[],
): ReservationGroupedByDate[] => {
  const grouped = reservations.reduce(
    (acc, reservation) => {
      const date = reservation.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reservation);
      return acc;
    },
    {} as Record<string, Reservation[]>,
  );

  // 날짜순으로 정렬
  return Object.keys(grouped)
    .sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    )
    .map((date) => ({
      date,
      reservations: grouped[date].sort((a, b) =>
        a.time.localeCompare(b.time),
      ),
    }));
};

// 날짜 범위로 예약 필터링
export const filterByDateRange = (
  reservations: Reservation[],
  startDate?: string,
  endDate?: string
): Reservation[] => {
  if (!startDate && !endDate) return reservations;
  
  return reservations.filter((res) => {
    const resDate = new Date(res.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && resDate < start) return false;
    if (end && resDate > end) return false;
    
    return true;
  });
};

// 예약을 매장 데이터로 변환
export const convertReservationToStoreData = (reservation: Reservation) => {
  return {
    id: reservation.storeId,
    name: reservation.storeName,
    address: reservation.storeAddress,
    phone: reservation.storePhone,
    distance: 0,
    rating: 4.5,
    reviewCount: 100,
    model: reservation.model,
    price: reservation.price,
    conditions: reservation.conditions,
    hours: "10:00 - 20:00",
    productCarrier: reservation.productCarrier,
    storage: reservation.storage,
  };
};

// 예약 상태별 필터링
export const filterReservationsByStatus = (
  reservations: Reservation[],
  statusType: "upcoming" | "past"
): Reservation[] => {
  if (statusType === "upcoming") {
    return reservations.filter((res) =>
      ["pending", "confirmed", "cancel_pending"].includes(res.status)
    );
  } else {
    return reservations.filter((res) =>
      ["completed", "cancelled"].includes(res.status)
    );
  }
};