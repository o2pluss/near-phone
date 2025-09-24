import { ProductSnapshot, ProductDisplayInfo } from '../types/product';

/**
 * 상품 표시 정보를 생성하는 유틸리티 함수
 * 삭제된 상품에 대한 적절한 표시 메시지를 생성합니다
 */
export function createProductDisplayInfo(
  productData: {
    name?: string;
    model?: string;
    storage?: string;
    carrier?: string;
    price?: number;
    isDeleted?: boolean;
    deletedAt?: string;
    deletionReason?: string;
  },
  context: 'reservation' | 'favorite' = 'reservation'
): ProductDisplayInfo {
  const {
    name = '알 수 없는 상품',
    model = '',
    storage = '',
    carrier = '',
    price = 0,
    isDeleted = false,
    deletedAt,
    deletionReason
  } = productData;

  let deletionMessage: string | undefined;
  let deletionStatus: ProductDisplayInfo['deletionStatus'];

  if (isDeleted) {
    deletionStatus = 'deleted_product';
    
    if (context === 'reservation') {
      deletionMessage = '삭제된 상품 (예약 이력만 유효)';
    } else if (context === 'favorite') {
      deletionMessage = '삭제된 상품 (예약 불가능)';
    }
  }

  return {
    name,
    model,
    storage,
    carrier,
    price,
    isDeleted,
    deletedAt,
    deletionStatus,
    deletionMessage
  };
}

/**
 * 예약에서 상품 정보를 안전하게 표시하는 함수
 */
export function getReservationProductDisplay(reservation: {
  model?: string;
  storage?: string;
  productCarrier?: string;
  price?: number;
  productSnapshot?: {
    name?: string;
    model?: string;
    storage?: string;
    carrier?: string;
    price?: number;
    isDeleted?: boolean;
    deletedAt?: string;
    deletionReason?: string;
  };
}): ProductDisplayInfo {
  // 스냅샷 데이터가 있으면 우선 사용
  if (reservation.productSnapshot) {
    return createProductDisplayInfo(reservation.productSnapshot, 'reservation');
  }

  // 스냅샷이 없으면 예약 데이터 직접 사용 (구버전 호환)
  return createProductDisplayInfo({
    name: reservation.model || '알 수 없는 상품',
    model: reservation.model || '',
    storage: reservation.storage || '',
    carrier: reservation.productCarrier || '',
    price: reservation.price || 0,
    isDeleted: false
  }, 'reservation');
}

/**
 * 즐겨찾기에서 상품 정보를 안전하게 표시하는 함수
 */
export function getFavoriteProductDisplay(favorite: {
  model?: string;
  storage?: string;
  productCarrier?: string;
  price?: number;
  productSnapshot?: {
    name?: string;
    model?: string;
    storage?: string;
    carrier?: string;
    price?: number;
    isDeleted?: boolean;
    deletedAt?: string;
    deletionReason?: string;
  };
}): ProductDisplayInfo {
  // 스냅샷 데이터가 있으면 우선 사용
  if (favorite.productSnapshot) {
    return createProductDisplayInfo(favorite.productSnapshot, 'favorite');
  }

  // 스냅샷이 없으면 즐겨찾기 데이터 직접 사용 (구버전 호환)
  return createProductDisplayInfo({
    name: favorite.model || '알 수 없는 상품',
    model: favorite.model || '',
    storage: favorite.storage || '',
    carrier: favorite.productCarrier || '',
    price: favorite.price || 0,
    isDeleted: false
  }, 'favorite');
}

/**
 * 삭제된 상품 여부를 확인하는 함수
 */
export function isProductDeleted(productData: {
  isDeleted?: boolean;
  productSnapshot?: { isDeleted?: boolean };
}): boolean {
  return productData.productSnapshot?.isDeleted || productData.isDeleted || false;
}

/**
 * 삭제된 상품의 UI 스타일을 반환하는 함수
 */
export function getDeletedProductStyles() {
  return {
    textColor: 'text-muted-foreground',
    strikethrough: 'line-through',
    opacity: 'opacity-70',
    backgroundColor: 'bg-gray-50',
    borderColor: 'border-gray-300'
  };
}

/**
 * 통신사 코드를 한글 이름으로 변환하는 함수
 */
export function getCarrierDisplayName(carrier?: string): string {
  switch (carrier?.toLowerCase()) {
    case 'kt':
      return 'KT';
    case 'skt':
      return 'SKT';
    case 'lgu':
      return 'LG U+';
    default:
      return '통신사 미정';
  }
}

/**
 * 예약 정보에서 제품 표시명을 생성하는 함수 (통신사 · 모델명 · 용량)
 */
export function getProductDisplayName(reservation: {
  model?: string;
  storage?: string;
  productCarrier?: string;
  productSnapshot?: {
    model?: string;
    storage?: string;
    carrier?: string;
  };
}): string {
  const productInfo = getReservationProductDisplay(reservation);
  
  const carrier = getCarrierDisplayName(productInfo.carrier);
  const model = productInfo.model || '모델명 미정';
  const storage = productInfo.storage || '용량 미정';
  
  return `${carrier} · ${model} · ${storage}`;
}