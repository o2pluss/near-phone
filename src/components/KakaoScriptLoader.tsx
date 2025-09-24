'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { initKakao } from '@/lib/kakao';

export default function KakaoScriptLoader() {
  useEffect(() => {
    // 컴포넌트가 마운트될 때 카카오 SDK가 이미 로드되어 있는지 확인
    if (typeof window !== 'undefined' && window.Kakao) {
      console.log('카카오 SDK가 이미 로드됨');
      initKakao();
    }
  }, []);

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.8/kakao.min.js"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log('카카오 SDK 전역 로드 완료');
        if (typeof window !== 'undefined' && window.Kakao) {
          initKakao();
        }
      }}
    />
  );
}
