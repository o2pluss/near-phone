import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  User,
  Phone,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

interface MyPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function MyPage({ onBack, onLogout }: MyPageProps) {
  const { user } = useAuthStore();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [isWithdrawalConfirmed, setIsWithdrawalConfirmed] = useState(false);

  const handleWithdrawal = () => {
    if (isWithdrawalConfirmed) {
      console.log('회원 탈퇴 처리');
      // 실제 탈퇴 처리 로직 추가
      setIsWithdrawalDialogOpen(false);
      setIsWithdrawalConfirmed(false);
      onLogout(); // 탈퇴 후 로그아웃 처리
    }
  };

  const handleWithdrawalDialogClose = () => {
    setIsWithdrawalDialogOpen(false);
    setIsWithdrawalConfirmed(false);
  };

  const menuItems = [
    {
      icon: Shield,
      title: '개인정보 보호',
      description: '개인정보 처리방침',
      action: () => console.log('개인정보 보호'),
    },
    {
      icon: FileText,
      title: '이용약관',
      description: '서비스 이용약관',
      action: () => console.log('이용약관'),
    },
    {
      icon: HelpCircle,
      title: '고객센터',
      description: '문의 및 도움말',
      action: () => console.log('고객센터'),
    },
  ];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-md mx-auto bg-white min-h-full">
        {/* 프로필 섹션 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <div className="space-y-0.5 mt-1">
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3 text-blue-100" />
                  <p className="text-blue-100 text-sm">{user?.phone}</p>
                </div>
                {user?.email && (
                  <p className="text-blue-200 text-xs">{user.email}</p>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-2">
                {user?.loginType === 'kakao' ? '카카오톡 연동 계정' : '일반 계정'}
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 목록 */}
        <div className="px-4 pt-4 space-y-2">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4" onClick={item.action}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 로그아웃 버튼 */}
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* 탈퇴하기 버튼 */}
        <div className="px-4 pb-4">
          <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="w-full text-sm text-muted-foreground hover:text-red-600 underline transition-colors"
                onClick={() => setIsWithdrawalDialogOpen(true)}
              >
                탈퇴하기
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>회원 탈퇴</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-800">
                    탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="withdrawal-confirm"
                    checked={isWithdrawalConfirmed}
                    onCheckedChange={(checked) => setIsWithdrawalConfirmed(checked === true)}
                  />
                  <label
                    htmlFor="withdrawal-confirm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    위 내용을 확인했으며 탈퇴에 동의합니다.
                  </label>
                </div>
              </div>
              <DialogFooter className="flex flex-row space-x-2">
                <Button
                  variant="outline"
                  onClick={handleWithdrawalDialogClose}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleWithdrawal}
                  disabled={!isWithdrawalConfirmed}
                  className="flex-1"
                >
                  탈퇴하기
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}