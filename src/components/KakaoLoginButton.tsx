'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { initKakao, loginWithKakao, waitForKakao } from '@/lib/kakao';

interface KakaoLoginButtonProps {
  onSuccess: (userInfo: { id: string; nickname: string; profile_image?: string }) => void;
  onError: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function KakaoLoginButton({ 
  onSuccess, 
  onError, 
  className = "",
  children 
}: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  useEffect(() => {
    console.log('KakaoLoginButton 마운트됨');
    
    const initializeKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao && window.Kakao.isInitialized()) {
        console.log('카카오 SDK가 이미 초기화됨');
        setIsSdkReady(true);
      } else if (typeof window !== 'undefined' && window.Kakao) {
        console.log('카카오 SDK 로드됨, 초기화 시작');
        initKakao();
        setIsSdkReady(true);
      } else {
        console.log('카카오 SDK 대기 중...');
        // SDK가 로드될 때까지 대기
        const checkKakao = () => {
          if (window.Kakao) {
            console.log('카카오 SDK 로드됨, 초기화 시작');
            initKakao();
            setIsSdkReady(true);
          } else {
            setTimeout(checkKakao, 100);
          }
        };
        checkKakao();
      }
    };

    // 약간의 지연을 두고 초기화 (전역 스크립트 로드 완료 대기)
    setTimeout(initializeKakao, 1000);
  }, []);

  const handleKakaoLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // SDK 준비 상태 확인
      if (!isSdkReady) {
        await waitForKakao();
      }
      
      // 리다이렉트 방식으로 카카오 로그인
      await loginWithKakao();
      // 리다이렉트되므로 여기까지 도달하지 않음
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      onError(error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleKakaoLogin}
      disabled={isLoading || !isSdkReady}
      className={`w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 disabled:opacity-50 ${className}`}
    >
      {isLoading ? '로그인 중...' : (children || '카카오로 로그인')}
    </Button>
  );
}
