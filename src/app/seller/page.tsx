import { redirect } from 'next/navigation';

export default function SellerPage() {
  // 기본적으로 예약 관리 페이지로 리다이렉트
  redirect('/seller/reservations');
}
