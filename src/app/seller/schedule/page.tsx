"use client";

import SellerSchedule from '@/components/SellerSchedule';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';

export default function SchedulePage() {
  return (
    <SellerDashboardMain>
      <SellerSchedule onBack={() => window.history.back()} />
    </SellerDashboardMain>
  );
}
