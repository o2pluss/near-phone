/**
 * 가격 포맷팅 유틸리티 함수들
 */

/**
 * 기본 가격 포맷팅 - 콤마가 포함된 원 단위
 * @param price 가격 (숫자)
 * @returns 포맷된 가격 문자열 (예: "1,200,000원")
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0원';
  }
  
  return `${price.toLocaleString('ko-KR')}원`;
}

/**
 * 지도 핀용 가격 포맷팅 - 만원 단위 (지도에서만 사용)
 * @param price 가격 (숫자)
 * @returns 포맷된 가격 문자열 (예: "120만원")
 */
export function formatPriceForMap(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0만원';
  }
  
  const manWon = Math.round(price / 10000);
  return `${manWon}만원`;
}

/**
 * 입력 필드용 가격 포맷팅 - 콤마만 포함 (단위 없음)
 * @param price 가격 (숫자)
 * @returns 포맷된 가격 문자열 (예: "1,200,000")
 */
export function formatPriceInput(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0';
  }
  
  return price.toLocaleString('ko-KR');
}

/**
 * 가격 문자열에서 숫자만 추출
 * @param priceString 가격 문자열 (예: "1,200,000원" 또는 "1,200,000")
 * @returns 숫자 (예: 1200000)
 */
export function parsePriceString(priceString: string): number {
  if (typeof priceString !== 'string') {
    return 0;
  }
  
  // 숫자가 아닌 모든 문자 제거
  const numericString = priceString.replace(/[^\d]/g, '');
  const parsed = parseInt(numericString, 10);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 할인율 계산 및 포맷팅
 * @param originalPrice 원가
 * @param discountPrice 할인가
 * @returns 할인율 문자열 (예: "25%")
 */
export function formatDiscountRate(originalPrice: number, discountPrice: number): string {
  if (originalPrice <= 0 || discountPrice >= originalPrice) {
    return '0%';
  }
  
  const discountRate = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  return `${discountRate}%`;
}

/**
 * 가격 범위 포맷팅
 * @param minPrice 최소 가격
 * @param maxPrice 최대 가격
 * @returns 포맷된 가격 범위 문자열 (예: "1,000,000원 ~ 1,500,000원")
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  
  return `${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}`;
}

/**
 * 월 할부 가격 포맷팅
 * @param totalPrice 총 가격
 * @param months 할부 개월 수
 * @returns 포맷된 월 할부 가격 (예: "월 100,000원")
 */
export function formatMonthlyPrice(totalPrice: number, months: number): string {
  if (months <= 0) {
    return formatPrice(totalPrice);
  }
  
  const monthlyPrice = Math.round(totalPrice / months);
  return `월 ${formatPrice(monthlyPrice)}`;
}

/**
 * 가격 유효성 검증
 * @param price 가격
 * @returns 유효한 가격인지 여부
 */
export function isValidPrice(price: any): boolean {
  return typeof price === 'number' && !isNaN(price) && price >= 0;
}

// 타입 정의
export type PriceFormat = 'default' | 'map' | 'input';

/**
 * 포맷 타입에 따른 가격 포맷팅
 * @param price 가격
 * @param format 포맷 타입
 * @returns 포맷된 가격 문자열
 */
export function formatPriceByType(price: number, format: PriceFormat = 'default'): string {
  switch (format) {
    case 'map':
      return formatPriceForMap(price);
    case 'input':
      return formatPriceInput(price);
    case 'default':
    default:
      return formatPrice(price);
  }
}