"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StoreManagement from "@/components/seller/StoreManagement";
import SellerPageHeader from "@/components/seller/SellerPageHeader";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Edit } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StoreInfo, getCurrentUserStore, getSellerApplication } from "@/lib/store";

export default function StoreManagementPage() {
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 매장 정보 로드
  const loadStoreInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: existingStore, error: storeError } = await getCurrentUserStore();
      
      if (storeError) {
        console.error('매장 정보 조회 오류:', storeError);
        setError('매장 정보를 불러오는데 실패했습니다.');
        return;
      }

      setStoreInfo(existingStore);
    } catch (err) {
      console.error('매장 정보 로드 오류:', err);
      setError('매장 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoreInfo();
  }, []);

  const handleEditClick = () => {
    router.push('/seller/store-edit?mode=edit');
  };

  const handleCreateStore = () => {
    router.push('/seller/store-edit?mode=create');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 이미지 업로드는 이제 별도 페이지에서 처리
    console.log('이미지 업로드는 매장 수정 페이지에서 처리됩니다.');
  };

  const handleImageRemove = (index: number) => {
    // 이미지 삭제는 이제 별도 페이지에서 처리
    console.log('이미지 삭제는 매장 수정 페이지에서 처리됩니다.');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">매장 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SellerPageHeader title="매장 관리" />
      <div className="p-6">

      {storeInfo ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleEditClick} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>매장 정보 수정</span>
            </Button>
          </div>
          <StoreManagement
            storeInfo={{
              id: storeInfo.id || '',
              name: storeInfo.name,
              description: storeInfo.description,
              address: storeInfo.address,
              phone: storeInfo.phone,
              businessNumber: storeInfo.business_number,
              hours: storeInfo.hours,
              images: storeInfo.images,
            }}
            storeImages={storeInfo.images}
            onEditClick={handleEditClick}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">매장이 등록되지 않았습니다</h3>
            <Button onClick={handleCreateStore} size="lg">
              매장 등록하기
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
