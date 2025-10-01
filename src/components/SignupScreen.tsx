import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Store, Mail, Phone, Lock, Building, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SellerSignupFormData {
  name: string;
  email: string;
  password: string;
  storeName: string;
  phone: string;
  businessNumber: string;
}

interface SignupScreenProps {
  onBack?: () => void;
  onSignup?: (role: 'user' | 'seller') => void;
}

export default function SignupScreen({ onBack, onSignup }: SignupScreenProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmittedRef = useRef(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SellerSignupFormData>();

  // isSubmitted 상태 변경 추적
  useEffect(() => {
    console.log('isSubmitted 상태 변경:', isSubmitted);
    isSubmittedRef.current = isSubmitted;
  }, [isSubmitted]);

  const [isLoading, setIsLoading] = useState(false);

  const onSellerSubmit = async (data: SellerSignupFormData) => {
    console.log('Seller signup data:', data);
    setIsLoading(true);
    
    let createdUserId: string | null = null;
    
    try {
      // 1. 먼저 사용자 계정 생성 (자동 로그인 방지)
      const normalizedEmail = (data.email || '').trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          data: {
            role: 'seller',
            name: data.name,
            phone: data.phone,
            business_name: data.storeName,
            business_number: data.businessNumber
          },
          emailRedirectTo: undefined // 이메일 확인 없이 진행
        }
      });

      if (authError) {
        console.error('사용자 계정 생성 실패:', authError);
        alert('회원가입에 실패했습니다: ' + authError.message);
        return;
      }

      if (!authData.user) {
        alert('사용자 생성에 실패했습니다.');
        return;
      }

      createdUserId = authData.user.id;
      console.log('사용자 계정 생성 성공:', createdUserId);

      // 2. 프로필 생성 (RPC 함수 사용)
      console.log('프로필 생성 시작...');
      const { error: profileError } = await supabase.rpc('upsert_profile', {
        p_user_id: createdUserId,
        p_role: 'seller',
        p_name: data.name,
        p_phone: data.phone,
        p_login_type: 'email',
        p_is_active: false, // 승인 전까지 비활성화
      });

      if (profileError) {
        console.error('프로필 생성 실패:', profileError);
        alert('프로필 생성에 실패했습니다: ' + profileError.message);
        return;
      }

      console.log('프로필 생성 성공');

      // 3. 판매자 신청 데이터 저장
      console.log('판매자 신청 데이터 저장 시작...');
      const { error: applicationError } = await supabase
        .from('seller_applications')
        .insert({
          user_id: createdUserId,
          business_name: data.storeName,
          business_license: data.businessNumber,
          business_address: '', // 주소는 나중에 추가
          contact_name: data.name,
          contact_phone: data.phone,
          contact_email: data.email,
          business_description: '',
          status: 'pending',
        });

      if (applicationError) {
        console.error('판매자 신청 저장 실패:', applicationError);
        // 신청 저장 실패 시 프로필 삭제 시도
        try {
          await supabase.from('profiles').delete().eq('user_id', createdUserId);
          console.log('실패한 프로필 정리 완료');
        } catch (cleanupError) {
          console.error('프로필 정리 실패:', cleanupError);
        }
        alert('신청 저장에 실패했습니다: ' + applicationError.message);
        return;
      }

      console.log('판매자 신청 저장 성공');

      // 4. 회원가입 후 즉시 로그아웃 (자동 로그인 방지)
      console.log('회원가입 성공, 로그아웃 시작');
      
      // 즉시 로그아웃
      await supabase.auth.signOut();
      console.log('로그아웃 완료');
      
      // 상태를 업데이트 (로그아웃 후)
      setIsSubmitted(true);
      console.log('isSubmitted 상태를 true로 설정');
    } catch (error) {
      console.error('판매자 신청 오류:', error);
      
      // 사용자 계정이 생성되었다면 프로필 정리
      if (createdUserId) {
        try {
          await supabase.from('profiles').delete().eq('user_id', createdUserId);
          console.log('오류 발생으로 인한 프로필 정리 완료');
        } catch (cleanupError) {
          console.error('프로필 정리 실패:', cleanupError);
        }
      }
      
      alert('신청 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  };

  console.log('SignupScreen 렌더링, isSubmitted:', isSubmitted, 'ref:', isSubmittedRef.current);

  // isSubmitted가 true이면 즉시 완료 화면 표시 (ref도 확인)
  if (isSubmitted || isSubmittedRef.current) {
    console.log('가입 신청 완료 화면 표시');
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md text-center space-y-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">가입 신청 완료</h1>
            <p className="text-muted-foreground">
              판매자 회원가입 신청이 완료되었습니다.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-green-800 font-medium">
              관리자 승인 후 서비스를 이용하실 수 있습니다.
            </p>
          </div>
          <Button 
            onClick={() => {
              // 상태 초기화
              setIsSubmitted(false);
              
              if (onBack) {
                onBack();
              } else {
                window.location.href = '/auth/login';
              }
            }} 
            className="w-full"
          >
            로그인 화면으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div>
              <h1 className="text-2xl font-semibold">판매자 회원가입</h1>
            </div>
          </div>
        </div>
        <div>
          <form onSubmit={handleSubmit(onSellerSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seller-name">이름</Label>
              <div className="relative">
                <Input
                  id="seller-name"
                  placeholder="이름을 입력하세요"
                  {...register('name', {
                    required: '이름을 입력해주세요'
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-email">이메일</Label>
              <div className="relative">
                <Input
                  id="seller-email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  {...register('email', {
                    required: '이메일을 입력해주세요',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: '올바른 이메일 형식이 아닙니다'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="seller-password"
                  type="password"
                  placeholder="비밀번호를 입력하세요 (최소 6자)"
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                    minLength: {
                      value: 6,
                      message: '비밀번호는 최소 6자 이상이어야 합니다'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-name">매장명</Label>
              <div className="relative">
                <Input
                  id="store-name"
                  placeholder="매장명을 입력하세요"
                  {...register('storeName', {
                    required: '매장명을 입력해주세요'
                  })}
                />
              </div>
              {errors.storeName && (
                <p className="text-sm text-destructive">
                  {errors.storeName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-phone">연락처</Label>
              <div className="relative">
                <Input
                  id="seller-phone"
                  placeholder="개인 연락처"
                  {...register('phone', {
                    required: '연락처를 입력해주세요'
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-number">사업자등록번호</Label>
              <div className="relative">
                <Input
                  id="business-number"
                  placeholder="매장 사업자등록번호"
                  {...register('businessNumber', {
                    required: '사업자등록번호를 입력해주세요'
                  })}
                />
              </div>
              {errors.businessNumber && (
                <p className="text-sm text-destructive">
                  {errors.businessNumber.message}
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                판매자 가입은 관리자 승인이 필요합니다. 승인 후 서비스를 이용하실 수 있습니다.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  신청 중...
                </>
              ) : (
                '판매자 가입 신청'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}