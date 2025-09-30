'use client';

import { useAuth } from '@/contexts/AuthContext';
import { FavoriteProvider } from '@/contexts/FavoriteContext';

interface FavoriteProviderWrapperProps {
  children: React.ReactNode;
}

export default function FavoriteProviderWrapper({ children }: FavoriteProviderWrapperProps) {
  const { user, loading } = useAuth();
  
  // 로딩 중이면 로딩 상태 표시하지 않고 기본값 사용
  if (loading) {
    return (
      <FavoriteProvider userId="anonymous">
        {children}
      </FavoriteProvider>
    );
  }
  
  // 사용자가 로그인하지 않은 경우 기본 사용자 ID 사용
  const userId = user?.id || 'anonymous';
  
  return (
    <FavoriteProvider userId={userId}>
      {children}
    </FavoriteProvider>
  );
}
