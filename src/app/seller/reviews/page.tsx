import ReviewManagement from '@/components/seller/ReviewManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function ReviewsPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="리뷰 관리" />
      <ReviewManagement />
    </SellerDashboardMain>
  );
}
