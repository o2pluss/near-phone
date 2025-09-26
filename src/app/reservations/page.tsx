"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import ReservationList from "@/components/ReservationList";
import { Loader2 } from 'lucide-react';

export default function ReservationsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [reservationTab, setReservationTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/auth/login');
      return;
    }

    if (!loading && profile && profile.role !== 'user' && profile.role !== 'admin') {
      // 사용자 권한이 없는 경우
      if (profile.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/unauthorized');
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // 리다이렉트 중
  }

  if (profile.role !== 'user' && profile.role !== 'admin') {
    return null; // 리다이렉트 중
  }

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
