"use client";

import ReservationList from "@/components/ReservationList";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReservationsPage() {
  const router = useRouter();
  const [reservationTab, setReservationTab] = useState<'upcoming' | 'past'>('upcoming');

  const handleStoreSelect = (store: any) => {
    router.push(`/detail/${store.id}?from=reservations`);
  };

  return (
    <ReservationList 
      currentTab={reservationTab}
      onTabChange={setReservationTab}
      onStoreSelect={handleStoreSelect}
    />
  );
}
