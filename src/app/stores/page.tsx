"use client";

import StoreSearchScreen from "@/components/StoreSearchScreen";
import { useStores } from "@/hooks/useApi";

export default function StoresPage() {
  // 훅은 StoreSearchScreen 내부로 점진 이전 예정. 우선 페이지 구동 유지.
  useStores();
  return <StoreSearchScreen onStoreSelect={() => {}} onBack={() => {}} />;
}


