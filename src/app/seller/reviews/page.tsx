'use client';

import ReviewManagement from '@/components/seller/ReviewManagement';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

export default function ReviewsPage() {
  const { storeInfo, loading, error } = useCurrentStore();

  if (loading) {
    return (
      <SellerDashboardMain>
        <SellerPageHeader title="리뷰 관리" />
        <div className="p-8">
          <PageLoadingSpinner text="매장 정보를 불러오는 중..." />
        </div>
      </SellerDashboardMain>
    );
  }

  if (error || !storeInfo) {
    return (
      <SellerDashboardMain>
        <SellerPageHeader title="리뷰 관리" />
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2 text-red-600">오류가 발생했습니다</h3>
          <p className="text-muted-foreground mb-4">
            {error || '매장 정보를 불러올 수 없습니다.'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            다시 시도
          </Button>
        </div>
      </SellerDashboardMain>
    );
  }

  return (
    <SellerDashboardMain>
      <SellerPageHeader title="리뷰 관리" />
      <ReviewManagement storeId={storeInfo.id!} />
    </SellerDashboardMain>
  );
}
