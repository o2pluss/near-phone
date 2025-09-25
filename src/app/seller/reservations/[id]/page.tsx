"use client";

import ReservationDetail from '@/components/seller/ReservationDetail';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';

interface ReservationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  return (
    <SellerDashboardMain>
      <ReservationDetail 
        reservationId={params.id}
        onBack={() => window.history.back()}
      />
    </SellerDashboardMain>
  );
}
