"use client";

import StoreDetail from "@/components/StoreDetail";
import { useStoreProducts } from "@/hooks/useApi";

export default function StoreDetailPage({ params }: { params: { id: string } }) {
  useStoreProducts({ storeId: params.id });
  return <StoreDetail storeId={params.id} onBack={() => {}} />;
}


