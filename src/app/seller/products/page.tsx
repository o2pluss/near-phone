import ProductManagement from '@/components/seller/ProductManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function ProductsPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="상품 관리" />
      <ProductManagement />
    </SellerDashboardMain>
  );
}
