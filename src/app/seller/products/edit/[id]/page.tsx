'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProductTableEditor from '@/components/seller/ProductTableEditor';
import SellerDashboardMain from '@/components/seller/SellerDashboardMain';
import SellerPageHeader from '@/components/seller/SellerPageHeader';
import { getProductTable } from '@/lib/api/productTables';
import { getAllDeviceModels } from '@/lib/api/deviceModels';

interface EditProductTablePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductTablePage({ params }: EditProductTablePageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [existingProducts, setExistingProducts] = useState<any[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // params에서 id 추출
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // 기존 상품 테이블 데이터 로드
  useEffect(() => {
    const loadProductTable = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('편집할 테이블 ID:', id);
        
        const [tableData, deviceModels] = await Promise.all([
          getProductTable(id),
          getAllDeviceModels()
        ]);
        
        // 테이블 정보 저장
        setTableInfo({
          id: tableData.id,
          name: tableData.name,
          exposureStartDate: tableData.exposureStartDate,
          exposureEndDate: tableData.exposureEndDate
        });
        
        // 상품 테이블의 상품들을 existingProducts로 설정
        if (tableData.products && Array.isArray(tableData.products)) {
          // device_model_id를 실제 기기명으로 매핑
          const transformedProducts = tableData.products.map(product => {
            const deviceModel = deviceModels.find(model => model.id === product.device_model_id);
            return {
              ...product,
              deviceName: deviceModel?.deviceName || deviceModel?.model || 'Unknown Device',
            };
          });
          
          setExistingProducts(transformedProducts);
        } else {
          setExistingProducts([]);
        }
      } catch (err) {
        console.error('상품 테이블 데이터 로드 실패:', err);
        setError('상품 테이블 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProductTable();
  }, [id]);

  const handleSave = (savedData: any) => {
    // TODO: 실제 저장 로직 구현
    // 저장 후 목록 페이지로 이동
    router.push('/seller/products');
  };

  const handleCancel = () => {
    // 목록 페이지로 돌아가기
    router.push('/seller/products');
  };

  if (loading) {
    return (
      <SellerDashboardMain>
        <SellerPageHeader 
          title="상품 테이블 편집" 
          showBackButton 
          backHref="/seller/products"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">상품 테이블 데이터를 불러오는 중...</p>
          </div>
        </div>
      </SellerDashboardMain>
    );
  }

  if (error) {
    return (
      <SellerDashboardMain>
        <SellerPageHeader 
          title="상품 테이블 편집" 
          showBackButton 
          backHref="/seller/products"
        />
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </SellerDashboardMain>
    );
  }

  return (
    <SellerDashboardMain>
      <SellerPageHeader 
        title="상품 테이블 편집" 
        showBackButton 
        backHref="/seller/products"
      />
      <ProductTableEditor
        onSave={handleSave}
        onCancel={handleCancel}
        existingProducts={existingProducts}
        editingProducts={existingProducts}
        mode="edit"
        tableInfo={tableInfo}
      />
    </SellerDashboardMain>
  );
}
