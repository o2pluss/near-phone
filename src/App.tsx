import React, { useEffect } from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { user, profile, loading } = useAuth();

  // 인증 상태에 따른 자동 리다이렉트 (루트 페이지에서만)
  useEffect(() => {
    if (loading) return;
    
    // 루트 페이지(/)에서만 리다이렉트 실행
    if (window.location.pathname !== '/') {
      console.log('루트 페이지가 아니므로 리다이렉트하지 않음:', window.location.pathname);
      return;
    }
    
    console.log('App.tsx 리다이렉트 체크 - User:', !!user, 'Profile:', profile);
    
    if (user && profile) {
      if (profile.role === 'admin') {
        console.log('Admin 권한, /admin으로 리다이렉트');
        window.location.href = '/admin';
      } else if (profile.role === 'seller') {
        if (profile.is_active) {
          console.log('Seller 권한 (승인됨), /seller로 리다이렉트');
          window.location.href = '/seller';
        } else {
          console.log('Seller 권한 (미승인), /pending-approval로 리다이렉트');
          window.location.href = '/pending-approval';
        }
      } else if (profile.role === 'user') {
        console.log('User 권한, /main으로 리다이렉트');
        window.location.href = '/main';
      } else {
        console.log('알 수 없는 역할, /auth/login으로 리다이렉트');
        window.location.href = '/auth/login';
      }
    } else {
      console.log('사용자 또는 프로필 없음, /auth/login으로 리다이렉트');
      window.location.href = '/auth/login';
    }
  }, [user, profile, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-muted-foreground">페이지를 이동하는 중...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}