import React from "react";
import SellerDashboardMain from "./seller/SellerDashboardMain";

interface SellerDashboardProps {
  onScheduleView?: () => void;
  onReservationDetail?: (reservation: any) => void;
}

export default function SellerDashboard({
  onScheduleView,
  onReservationDetail,
}: SellerDashboardProps) {
  return (
    <SellerDashboardMain
      onScheduleView={onScheduleView}
      onReservationDetail={onReservationDetail}
    />
  );
}