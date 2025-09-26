'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SignupScreen from '@/components/SignupScreen';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

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

  const handleBack = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    // SignupScreen에서 처리됨
  };

  return (
    <div className="min-h-screen bg-background">
      <SignupScreen 
        onBack={handleBack}
        onSignup={handleSignup}
      />
    </div>
  );
}
