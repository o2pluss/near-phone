import type { Reservation } from '../types/reservation';

// API 데이터를 Reservation 타입으로 변환
export function transformApiReservationToReservation(apiReservation: any): Reservation {
  // 디버깅을 위한 로그
  console.log('Transforming API reservation:', apiReservation);
  
  const transformed = {
    id: apiReservation.id,
    storeId: apiReservation.store_id,
    storeName: apiReservation.store_snapshot?.name || '매장 정보 없음',
    storeAddress: apiReservation.store_snapshot?.address || '주소 정보 없음',
    storePhone: apiReservation.store_snapshot?.phone || '-',
    date: apiReservation.reservation_date,
    time: apiReservation.reservation_time,
    model: apiReservation.product_snapshot?.model || '상품 정보 없음',
    price: apiReservation.product_snapshot?.price || 0,
    status: apiReservation.status || 'pending',
    createdAt: apiReservation.created_at,
    updatedAt: apiReservation.updated_at,
    conditions: apiReservation.product_snapshot?.conditions || [],
    customerName: apiReservation.customer_name || '고객 정보 없음',
    customerPhone: apiReservation.customer_phone || '-',
    productCarrier: apiReservation.product_snapshot?.carrier || 'kt',
    storage: apiReservation.product_snapshot?.storage || '256gb',
    productSnapshot: apiReservation.product_snapshot,
    storeSnapshot: apiReservation.store_snapshot,
  };
  
  // storage 필드 디버깅
  console.log('Storage debug:', {
    original: apiReservation.product_snapshot?.storage,
    transformed: transformed.storage,
    productSnapshot: transformed.productSnapshot?.storage
  });
  
  return transformed;
}

// 여러 예약 데이터 변환
export function transformApiReservationsToReservations(apiReservations: any[]): Reservation[] {
  return apiReservations.map(transformApiReservationToReservation);
}
