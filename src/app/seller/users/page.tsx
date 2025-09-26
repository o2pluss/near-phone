import UserManagement from '@/components/seller/UserManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function UsersPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="회원 관리" />
      <UserManagement />
    </SellerDashboardMain>
  );
}
