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
  const [isSubmitted, setIsSubmitted] = useState(() => {
    // localStorage에서 isSubmitted 상태 복원
    if (typeof window !== 'undefined') {
      return localStorage.getItem('signupSubmitted') === 'true';
    }
    return false;
  });
  const isSubmittedRef = useRef(isSubmitted);
  const { register, handleSubmit, formState: { errors } } = useForm<SellerSignupFormData>();

  // isSubmitted 상태 변경 추적 및 localStorage 저장
  useEffect(() => {
    console.log('isSubmitted 상태 변경:', isSubmitted);
    isSubmittedRef.current = isSubmitted;
    
    if (typeof window !== 'undefined') {
      if (isSubmitted) {
        localStorage.setItem('signupSubmitted', 'true');
      } else {
        localStorage.removeItem('signupSubmitted');
      }
    }
  }, [isSubmitted]);

  const [isLoading, setIsLoading] = useState(false);

  const onSellerSubmit = async (data: SellerSignupFormData) => {
    console.log('Seller signup data:', data);
    setIsLoading(true);
    
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

      // 2. 프로필 생성 (RPC 함수 사용)
      const { error: profileError } = await supabase.rpc('upsert_profile', {
        p_user_id: authData.user.id,
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

      // 3. 판매자 신청 데이터 저장
      const { error: applicationError } = await supabase
        .from('seller_applications')
        .insert({
          user_id: authData.user.id,
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
        alert('신청 저장에 실패했습니다: ' + applicationError.message);
        return;
      }

      // 4. 회원가입 후 즉시 로그아웃 (자동 로그인 방지)
      console.log('회원가입 성공, 로그아웃 시작');
      
      // 상태를 먼저 업데이트 (함수형 업데이트 사용)
      setIsSubmitted(prev => {
        console.log('isSubmitted 함수형 업데이트, 이전 값:', prev, '새 값: true');
        return true;
      });
      
      // 즉시 로그아웃
      await supabase.auth.signOut();
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('판매자 신청 오류:', error);
      alert('신청 중 오류가 발생했습니다.');
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
            <p className="text-xs text-green-700">
              승인 결과는 등록하신 이메일로 안내드립니다.
            </p>
          </div>
          <Button 
            onClick={() => {
              // localStorage 클리어
              if (typeof window !== 'undefined') {
                localStorage.removeItem('signupSubmitted');
              }
              
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