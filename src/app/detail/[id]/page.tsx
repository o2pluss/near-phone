'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StoreDetail from '@/components/StoreDetail';

export default function DetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const storeId = params.id as string;
  const fromReservation = searchParams.get('from') === 'reservation';

  const handleBack = () => {
    if (fromReservation && user && profile) {
      router.push('/reservations');
    } else {
      router.push('/stores');
    }
  };

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">매장 정보를 찾을 수 없습니다.</div>
          <button 
            onClick={handleBack} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <StoreDetail 
      storeId={storeId} 
      onBack={handleBack}
      hideConditionsAndBooking={fromReservation}
      user={user}
      profile={profile}
    />
  );
}