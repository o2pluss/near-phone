import DeviceManagement from '@/components/seller/DeviceManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function DevicesPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="단말기 등록" />
      <DeviceManagement />
    </SellerDashboardMain>
  );
}
