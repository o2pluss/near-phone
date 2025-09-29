'use client';

import { useRouter } from 'next/navigation';
import ProductTableEditor from '@/components/seller/ProductTableEditor';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';

export default function CreateProductTablePage() {
  const router = useRouter();

  const handleSave = (savedData: any) => {
    console.log('새 상품 테이블 저장 완료:', savedData);
    // 저장 후 목록 페이지로 이동
    router.push('/seller/products');
  };

  const handleCancel = () => {
    // 목록 페이지로 돌아가기
    router.push('/seller/products');
  };

  return (
    <SellerDashboardMain>
      <SellerPageHeader 
        title="가격표" 
        showBackButton 
        backHref="/seller/products"
      />
      <ProductTableEditor
        onSave={handleSave}
        onCancel={handleCancel}
        existingProducts={[]}
        editingProducts={[]}
        mode="bulk"
      />
    </SellerDashboardMain>
  );
}
