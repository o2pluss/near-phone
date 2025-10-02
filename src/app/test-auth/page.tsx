'use client';

import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

export default function TestAuthPage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <PageLoadingSpinner text="로딩 중..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>인증 상태 테스트</span>
              </CardTitle>
              <CardDescription>
                Supabase Auth 시스템이 정상적으로 작동하는지 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">✅ 로그인됨</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>이메일: {user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>사용자 ID: {user.id}</span>
                      </div>
                      {profile && (
                        <>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>이름: {profile.name || '설정되지 않음'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>전화번호: {profile.phone || '설정되지 않음'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <span>역할: {profile.role}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button onClick={() => signOut()} variant="destructive">
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 로그인되지 않음</h3>
                  <p className="text-sm text-yellow-700">
                    로그인하려면 상단의 로그인 버튼을 클릭하세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>테스트 기능</CardTitle>
              <CardDescription>
                인증 시스템의 다양한 기능을 테스트할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="h-20 flex-col space-y-2"
                >
                  <User className="h-6 w-6" />
                  <span>로그인 페이지</span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/auth/signup'}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                >
                  <User className="h-6 w-6" />
                  <span>회원가입 페이지</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
