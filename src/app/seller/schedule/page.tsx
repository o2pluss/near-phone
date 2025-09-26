"use client";

import SellerSchedule from '@/components/SellerSchedule';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function SchedulePage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="스케줄" />
      <SellerSchedule onBack={() => window.history.back()} />
    </SellerDashboardMain>
  );
}
