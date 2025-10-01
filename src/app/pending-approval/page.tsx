"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Supabase 로그아웃 처리
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 오류:', error);
        // 오류가 발생해도 로그인 페이지로 이동
      }
      
      // 로그인 페이지로 이동
      router.push('/auth/login');
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/auth/login');
    }
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
