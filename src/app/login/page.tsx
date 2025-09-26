"use client";

import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // /login을 /auth/login으로 리다이렉트
    window.location.href = '/auth/login';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="text-muted-foreground">로그인 페이지로 이동하는 중...</p>
      </div>
    </div>
  );
}


