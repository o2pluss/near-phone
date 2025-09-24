/**
 * 개인정보 마스킹 유틸리티
 * 
 * 보안 고려사항:
 * - 현재는 프론트엔드에서 처리하지만, 실제 운영 환경에서는 서버에서 처리해야 함
 * - 서버에서 사용자 권한에 따라 다른 형태의 데이터를 응답하는 것이 보안상 안전
 */

export type UserRole = 'user' | 'seller' | 'admin';

/**
 * 사용자 이름 마스킹 처리
 * @param name 원본 이름
 * @param viewerRole 조회하는 사용자의 권한
 * @returns 권한에 따라 마스킹된 이름
 */
export function maskUserName(name: string, viewerRole: UserRole): string {
  if (!name || name.trim() === '') {
    return '익명';
  }

  // 관리자는 전체 이름 조회 가능
  if (viewerRole === 'admin') {
    return name;
  }

  // 사용자와 판매자는 첫 글자만 보이고 나머지는 마스킹
  const trimmedName = name.trim();
  
  if (trimmedName.length === 1) {
    return trimmedName;
  }
  
  // 첫 글자 + 나머지는 * 처리
  const firstChar = trimmedName.charAt(0);
  const maskedPart = '*'.repeat(trimmedName.length - 1);
  
  return `${firstChar}${maskedPart}`;
}

/**
 * 전화번호 마스킹 처리 (필요시 사용)
 * @param phone 원본 전화번호
 * @param viewerRole 조회하는 사용자의 권한
 * @returns 권한에 따라 마스킹된 전화번호
 */
export function maskPhoneNumber(phone: string, viewerRole: UserRole): string {
  if (!phone || phone.trim() === '') {
    return '';
  }

  // 관리자는 전체 번호 조회 가능
  if (viewerRole === 'admin') {
    return phone;
  }

  // 사용자와 판매자는 중간 번호 마스킹
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  if (cleaned.length === 11) {
    // 010-1234-5678 -> 010-****-5678
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  }
  
  // 다른 형태의 번호는 뒤 4자리만 표시
  if (cleaned.length >= 4) {
    const visible = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return `${masked}${visible}`;
  }
  
  return '*'.repeat(cleaned.length);
}

/**
 * 리뷰 데이터에서 개인정보 마스킹 처리
 * 실제 운영 환경에서는 서버에서 이 처리를 해야 함
 */
export function maskReviewData<T extends { customerName: string }>(
  data: T,
  viewerRole: UserRole
): T {
  return {
    ...data,
    customerName: maskUserName(data.customerName, viewerRole)
  };
}

/**
 * 리뷰 목록에서 개인정보 마스킹 처리
 */
export function maskReviewList<T extends { customerName: string }>(
  reviews: T[],
  viewerRole: UserRole
): T[] {
  return reviews.map(review => maskReviewData(review, viewerRole));
}

/**
 * 서버 마이그레이션을 위한 타입 정의
 * 실제 서버 구현 시 사용할 인터페이스
 */
export interface PrivacyConfig {
  maskUserNames: boolean;
  maskPhoneNumbers: boolean;
  allowedRoles: UserRole[];
}

/**
 * 서버 구현 시 사용할 설정
 */
export const PRIVACY_SETTINGS: Record<UserRole, PrivacyConfig> = {
  admin: {
    maskUserNames: false,
    maskPhoneNumbers: false,
    allowedRoles: ['admin']
  },
  seller: {
    maskUserNames: true,
    maskPhoneNumbers: true,
    allowedRoles: ['seller', 'admin']
  },
  user: {
    maskUserNames: true,
    maskPhoneNumbers: true,
    allowedRoles: ['user', 'seller', 'admin']
  }
};