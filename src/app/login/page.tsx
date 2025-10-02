"use client";

import { useEffect } from 'react';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

export default function LoginPage() {
  useEffect(() => {
    // /login을 /auth/login으로 리다이렉트
    window.location.href = '/auth/login';
  }, []);

  return (
    <PageLoadingSpinner text="로그인 페이지로 이동하는 중..." />
  );
}


