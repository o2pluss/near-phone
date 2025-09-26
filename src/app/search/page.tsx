'use client';

import { useRouter } from 'next/navigation';
import StoreSearchScreen from '@/components/StoreSearchScreen';

export default function SearchPage() {
  const router = useRouter();

  const handleStoreSelect = (store: any) => {
    router.push(`/detail/${store.id}`);
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