import ProductTableManagement from '@/components/seller/ProductTableManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function ProductsPage() {
  return (
    <SellerDashboardMain>
      <SellerPageHeader title="상품 관리" />
      <ProductTableManagement />
    </SellerDashboardMain>
  );
}
