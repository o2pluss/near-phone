"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      const redirectTo = searchParams.get('redirect');
      
      // redirect 파라미터가 있으면 해당 페이지로 이동
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      
      // 역할별 기본 페이지로 리다이렉트
      if (profile.role === 'admin') {
        console.log('Admin 권한, /admin으로 리다이렉트');
        router.push('/admin');
      } else if (profile.role === 'seller') {
        if (profile.is_active) {
          console.log('Seller 권한 (승인됨), /seller로 리다이렉트');
          router.push('/seller');
        } else {
          console.log('Seller 권한 (미승인), /pending-approval로 리다이렉트');
          router.push('/pending-approval');
        }
      } else if (profile.role === 'user') {
        console.log('User 권한, /main으로 리다이렉트');
        router.push('/main');
      } else {
        console.log('알 수 없는 역할, /main으로 리다이렉트');
        router.push('/main');
      }
    }
  }, [user, profile, loading, router, searchParams]);

  if (loading) {
    return <PageLoadingSpinner text="로딩 중..." />;
  }

  if (user && profile) {
    return null; // 리다이렉트 중
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('로그인 실패:', error);
      }
      // useEffect에서 역할별 리다이렉트 처리
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  const handleKakaoLogin = () => {
    const redirectTo = searchParams.get('redirect') || '/';
    router.push(redirectTo);
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSignup={handleSignup}
      onKakaoLogin={handleKakaoLogin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
