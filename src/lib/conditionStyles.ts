import { 
  ArrowRightLeft, 
  CreditCard, 
  UserPlus, 
  Link, 
  Wallet,
  Shield,
  Clock,
  Gift
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ConditionStyle {
  icon: LucideIcon | null;
  className: string;
}

/**
 * 조건별 아이콘과 색상 스타일을 반환하는 유틸 함수
 * @param condition 조건 문자열
 * @returns 아이콘과 className을 포함한 객체
 */
export const getConditionStyle = (condition: string): ConditionStyle => {
  switch (condition) {
    case '번호이동':
    case '신규가입':
    case '기기변경':
      return {
        icon: null,
        className: 'bg-gray-100 text-gray-700',
      };
    case '카드할인':
      return {
        icon: CreditCard,
        className: 'bg-teal-50 text-teal-700',
      };
    case '결합할인':
      return {
        icon: Link,
        className: 'bg-amber-50 text-amber-700',
      };
    case '필수요금제':
      return {
        icon: Shield,
        className: 'bg-violet-50 text-violet-700',
      };
    case '부가서비스':
      return {
        icon: Gift,
        className: 'bg-pink-50 text-pink-700',
      };
    default:
      return {
        icon: null,
        className: 'bg-gray-50 text-gray-600',
      };
  }
};

/**
 * 조건 배지 컴포넌트에서 사용할 완전한 클래스명을 반환
 * @param condition 조건 문자열
 * @returns 배지에 적용할 완전한 className
 */
export const getConditionBadgeClass = (condition: string): string => {
  const { className } = getConditionStyle(condition);
  return `text-xs px-1.5 py-0.5 ${className}`;
};