'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // 리다이렉트 중
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('로그인 실패:', error);
      } else {
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      }
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
