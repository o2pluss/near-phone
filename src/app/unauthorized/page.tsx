'use client';

import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              접근 권한이 없습니다
            </h1>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-red-800 font-medium">
            현재 계정으로는 이 페이지에 접근할 수 없습니다.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로 돌아가기
          </Button>
          <Button 
            onClick={() => router.push('/auth/login')} 
            className="w-full"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}
