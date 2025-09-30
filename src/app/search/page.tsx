"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StoreSearchScreen from '@/components/StoreSearchScreen';

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStoreSelect = (store: any) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (store.selectedProduct) {
      currentParams.set('productId', store.selectedProduct.id);
    }
    currentParams.set('from', 'search');
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

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}