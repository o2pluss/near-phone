'use client';

import React, { useEffect, useState } from 'react';

export default function KakaoDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      hasWindow: typeof window !== 'undefined',
      hasKakao: typeof window !== 'undefined' && !!window.Kakao,
      isInitialized: typeof window !== 'undefined' && window.Kakao?.isInitialized(),
      hasAuth: typeof window !== 'undefined' && !!window.Kakao?.Auth,
      hasAuthorize: typeof window !== 'undefined' && !!(window.Kakao?.Auth?.authorize),
      appKey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY,
      appKeyLength: process.env.NEXT_PUBLIC_KAKAO_APP_KEY?.length || 0,
      kakaoVersion: typeof window !== 'undefined' && window.Kakao?.VERSION,
      authMethods: typeof window !== 'undefined' && window.Kakao?.Auth ? Object.keys(window.Kakao.Auth) : [],
      allMethods: typeof window !== 'undefined' && window.Kakao ? Object.keys(window.Kakao) : [],
    };
    
    setDebugInfo(info);
    console.log('카카오 디버그 정보:', info);
    
    // 추가 디버깅
    if (typeof window !== 'undefined' && window.Kakao) {
      console.log('Kakao 객체 전체:', window.Kakao);
      console.log('Kakao.Auth 객체:', window.Kakao.Auth);
      if (window.Kakao.Auth) {
        console.log('Auth 메서드들:', Object.getOwnPropertyNames(window.Kakao.Auth));
      }
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm">
      <h3 className="font-bold mb-2">카카오 SDK 디버그 정보</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
