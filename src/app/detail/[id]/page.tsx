"use client";

import StoreDetail from "@/components/StoreDetail";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const storeId = params.id as string;
  const fromReservation = searchParams.get('from') === 'reservations';

  const handleBack = () => {
    if (fromReservation) {
      router.push('/reservations');
    } else {
      router.push('/search');
    }
  };

  return (
    <StoreDetail 
      storeId={storeId}
      onBack={handleBack}
      hideConditionsAndBooking={fromReservation}
    />
  );
}
