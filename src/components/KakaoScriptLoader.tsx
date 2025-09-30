'use client';

import { useEffect } from 'react';
import { initKakao } from '@/lib/kakao';

export default function KakaoScriptLoader() {
  useEffect(() => {
    // 카카오 SDK가 로드될 때까지 대기
    const checkKakao = () => {
      if (typeof window !== 'undefined' && window.Kakao) {
        console.log('카카오 SDK 로드됨, 초기화 시작');
        initKakao();
      } else {
        setTimeout(checkKakao, 100);
      }
    };

    // 약간의 지연을 두고 초기화 (전역 스크립트 로드 완료 대기)
    setTimeout(checkKakao, 1000);
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
