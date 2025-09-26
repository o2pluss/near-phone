"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // 로그아웃 로직 (필요한 경우)
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">승인 대기중</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-yellow-800 font-medium">
              관리자 승인 후 서비스를 이용하실 수 있습니다.
            </p>
            <p className="text-xs text-yellow-700">
              승인 결과는 등록하신 이메일로 안내드립니다.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleLogout} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인 화면으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
