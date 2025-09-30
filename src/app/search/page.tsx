'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import StoreSearchScreen from '@/components/StoreSearchScreen';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStoreSelect = (store: any) => {
    // 현재 검색 상태를 유지하면서 매장 상세로 이동
    const currentParams = new URLSearchParams(searchParams.toString());
    if (store.selectedProduct) {
      currentParams.set('productId', store.selectedProduct.id);
    }
    currentParams.set('from', 'search'); // 매장 찾기에서 온 경우 표시
    const queryString = currentParams.toString();
    const url = `/detail/${store.id}?${queryString}`;
    router.push(url);
  };

  const handleBack = () => {
    router.push('/main');
  };

  return (
    <StoreSearchScreen 
      onStoreSelect={handleStoreSelect}
      onBack={handleBack}
    />
  );
}