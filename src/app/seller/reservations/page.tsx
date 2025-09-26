import ReservationManagementWithData from '@/components/seller/ReservationManagementWithData';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function ReservationsPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="예약 관리" />
      <ReservationManagementWithData />
    </SellerDashboardMain>
  );
}
