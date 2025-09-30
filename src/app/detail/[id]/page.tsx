"use client";

import { Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StoreDetail from '@/components/StoreDetail';

function DetailPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const storeId = params.id as string;
  const productId = searchParams.get('productId');
  const fromReservation = searchParams.get('from') === 'reservation';
  const fromSearch = searchParams.get('from') === 'search';

  const handleBack = () => {
    if (fromReservation && user && profile) {
      router.push('/reservations');
    } else if (fromSearch) {
      // 검색 상태를 유지하면서 매장 찾기 페이지로 이동
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.delete('productId'); // productId는 제거
      currentParams.delete('from'); // from 파라미터는 제거
      const queryString = currentParams.toString();
      const url = queryString ? `/search?${queryString}` : '/search';
      router.push(url);
    } else {
      router.push('/main'); // 기본적으로 메인 페이지로 이동
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
      productId={productId}
    />
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailPageInner />
    </Suspense>
  );
}