'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, LogOut, Save } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileProps {
  onSignOut?: () => void;
}

export function UserProfile({ onSignOut }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, signOut, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    reset({
      name: profile?.name || '',
      phone: profile?.phone || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    reset({
      name: profile?.name || '',
      phone: profile?.phone || '',
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await updateProfile(data);
      
      if (error) {
        setError(error.message);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      onSignOut?.();
    } catch (err) {
      console.error('로그아웃 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return null;
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'seller':
        return '판매자';
      case 'user':
      default:
        return '일반 사용자';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt={profile.name || 'User'} />
            <AvatarFallback className="text-lg">
              {profile.name ? getInitials(profile.name) : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{profile.name || '사용자'}</CardTitle>
            <CardDescription>{getRoleText(profile.role)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">이메일</Label>
          <p className="text-sm">{user.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                placeholder="010-1234-5678"
                {...register('phone')}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">이름</Label>
              <p className="text-sm">{profile.name || '설정되지 않음'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">전화번호</Label>
              <p className="text-sm">{profile.phone || '설정되지 않음'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">가입일</Label>
              <p className="text-sm">
                {new Date(profile.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={isLoading}
                className="flex-1"
              >
                프로필 수정
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
