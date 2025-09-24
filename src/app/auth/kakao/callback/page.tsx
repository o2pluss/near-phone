'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const { signInWithKakao } = useAuth();
  const [status] = useState('loading...');
  const executedRef = useRef(false);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // 이미 로그인된 상태면 즉시 리다이렉트 (중복 호출 방지)
        const { data: currentUser } = await supabase.auth.getUser();
        if (currentUser.user) {
          router.replace('/');
          return;
        }
        
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('인증 코드를 찾을 수 없습니다.');
        }

        // 중복 요청 방지 (React StrictMode/재렌더 대비)
        const sessionKey = `kakao_code_processed:${code}`;
        if (executedRef.current || sessionStorage.getItem(sessionKey) === '1') {
          // 이미 처리됨 → 홈으로
          router.replace('/');
          return;
        }
        executedRef.current = true;
        sessionStorage.setItem(sessionKey, '1');

        // 서버에서 사용자 정보 조회 (액세스 토큰 발급 포함)
        try {
          const response = await fetch('/api/kakao/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('서버 오류:', errorData);
            throw new Error(`서버에서 사용자 정보 조회 실패: ${errorData.error || '알 수 없는 오류'}`);
          }

          const userInfo = await response.json();
          console.log('사용자 정보 조회 성공:', userInfo);
          
          // Supabase 로그인 처리
          const { error } = await signInWithKakao(userInfo);
          
          if (error) {
            console.error('로그인 실패:', error);
            router.replace('/auth/login?error=kakao_login_failed');
          } else {
            console.log('로그인 성공');
            // URL 정리 (code 제거) 후 이동
            window.history.replaceState({}, '', '/auth/kakao/callback');
            router.replace('/');
          }
        } catch (apiError) {
          console.error('사용자 정보 조회 실패:', apiError);
          // authorization code 재사용/중복 교환(KOE320) 등은 무시하고, 세션이 생겼는지 마지막 확인
          const { data: afterUser } = await supabase.auth.getUser();
          if (afterUser.user) {
            window.history.replaceState({}, '', '/auth/kakao/callback');
            router.replace('/');
          } else {
            router.replace('/auth/login?error=user_info_failed');
          }
        }
      } catch (error) {
        console.error('카카오 콜백 처리 오류:', error);
        router.replace('/auth/login?error=callback_error');
      }
    };

    // 최초 1회만 트리거
    if (!executedRef.current) {
      handleKakaoCallback();
    }
  }, [router, signInWithKakao]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}
