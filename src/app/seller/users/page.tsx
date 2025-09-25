import UserManagement from '@/components/seller/UserManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';

export default function UsersPage() {
  return (
    <SellerDashboardMain>
      <UserManagement />
    </SellerDashboardMain>
  );
}
