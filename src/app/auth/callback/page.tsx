"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

function AuthCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // 사용자 프로필이 있는지 확인
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // 프로필이 없으면 생성 (OAuth 로그인 시)
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.session.user.id,
                role: 'user',
                name: data.session.user.user_metadata?.full_name || null,
                phone: data.session.user.user_metadata?.phone || null,
                login_type: 'kakao',
                is_active: true,
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              setError('프로필 생성 중 오류가 발생했습니다.');
              return;
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            setError('프로필 조회 중 오류가 발생했습니다.');
            return;
          }
        }

        // 리다이렉트 URL 확인
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('인증 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500">
            <h2 className="text-lg font-semibold">로그인 오류</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            다시 로그인
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackPageInner />
    </Suspense>
  );
}
