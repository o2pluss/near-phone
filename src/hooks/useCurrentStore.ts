import { useState, useEffect } from 'react';
import { getCurrentUserStore } from '@/lib/store';
import { StoreInfo } from '@/lib/store';

export const useCurrentStore = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: storeError } = await getCurrentUserStore();
        
        if (storeError) {
          setError(storeError.message || '매장 정보를 불러올 수 없습니다.');
          return;
        }
        
        if (!data) {
          setError('등록된 매장이 없습니다. 매장 등록을 먼저 완료해주세요.');
          return;
        }
        
        setStoreInfo(data);
      } catch (err) {
        console.error('매장 정보 조회 실패:', err);
        setError('매장 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  return { storeInfo, loading, error };
};
