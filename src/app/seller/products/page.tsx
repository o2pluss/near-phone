import ProductManagement from '@/components/seller/ProductManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';

export default function ProductsPage() {
  return (
    <SellerDashboardMain>
      <ProductManagement />
    </SellerDashboardMain>
  );
}
