"use client";

import FavoriteStores from "@/components/FavoriteStores";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();

  const handleStoreSelect = (store: any) => {
    router.push(`/detail/${store.id}`);
  };

  return (
    <FavoriteStores onStoreSelect={handleStoreSelect} />
  );
}
