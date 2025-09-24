"use client";

import StoreSearchScreen from "@/components/StoreSearchScreen";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();

  const handleStoreSelect = (store: any) => {
    router.push(`/detail/${store.id}`);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <StoreSearchScreen 
      onStoreSelect={handleStoreSelect}
      onBack={handleBack}
    />
  );
}
