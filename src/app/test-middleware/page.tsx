'use client';

import { useEffect } from 'react';

export default function TestMiddlewarePage() {
  useEffect(() => {
    console.log('=== 테스트 페이지 로드됨 ===');
    console.log('현재 URL:', window.location.href);
    
    // 응답 헤더 확인
    fetch('/test-middleware')
      .then(response => {
        console.log('응답 헤더:');
        console.log('X-Middleware-Path:', response.headers.get('X-Middleware-Path'));
        console.log('X-Middleware-Session:', response.headers.get('X-Middleware-Session'));
        console.log('X-Middleware-UserID:', response.headers.get('X-Middleware-UserID'));
      })
      .catch(error => {
        console.error('요청 실패:', error);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">미들웨어 테스트 페이지</h1>
        <p className="text-muted-foreground">브라우저 콘솔을 확인하세요</p>
        <div className="space-y-2">
          <a href="/main" className="block text-blue-600 hover:underline">/main 페이지로 이동</a>
          <a href="/admin" className="block text-blue-600 hover:underline">/admin 페이지로 이동</a>
          <a href="/auth/login" className="block text-blue-600 hover:underline">/auth/login 페이지로 이동</a>
        </div>
      </div>
    </div>
  );
}
