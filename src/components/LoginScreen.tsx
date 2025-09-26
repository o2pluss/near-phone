import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { useForm } from "react-hook-form";
import {
  Smartphone,
  Mail,
  Lock,
  User,
  Store,
} from "lucide-react";
import KakaoLoginButton from "./KakaoLoginButton";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignup?: () => void;
  onKakaoLogin?: () => void;
}

export default function LoginScreen({
  onLogin,
  onSignup,
  onKakaoLogin,
}: LoginScreenProps) {
  const handleSignup = () => {
    if (typeof onSignup === 'function') {
      onSignup();
    }
  };
  const [activeTab, setActiveTab] = useState("user");
  const { signInWithKakao } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>();

  const onSellerSubmit = (data: LoginFormData) => {
    // 실제 로그인 로직
    console.log("Seller login data:", data);
    onLogin(data.email, data.password);
  };

  const handleKakaoLoginSuccess = async (userInfo: { id: string; nickname: string; profile_image?: string }) => {
    // 리다이렉트 방식에서는 이 함수가 호출되지 않음
    console.log('카카오 로그인 성공 (리다이렉트 방식에서는 호출되지 않음)');
  };

  const handleKakaoLoginError = (error: any) => {
    console.error('카카오 로그인 오류:', error);
    alert('카카오 로그인에 실패했습니다.');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    reset(); // Clear form when switching tabs
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            로그인
          </h1>
        </div>
        <div>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="user"
                className="flex items-center space-x-2"
              >
                <span>일반회원</span>
              </TabsTrigger>
              <TabsTrigger
                value="seller"
                className="flex items-center space-x-2"
              >
                <span>판매점</span>
              </TabsTrigger>
            </TabsList>

            {/* 사용자 로그인 탭 */}
            <TabsContent
              value="user"
              className="space-y-4 mt-6"
            >
              <div className="text-center space-y-4">
                <div className="space-y-3">
                  <KakaoLoginButton
                    onSuccess={handleKakaoLoginSuccess}
                    onError={handleKakaoLoginError}
                  >
                    카카오로 로그인
                  </KakaoLoginButton>
                </div>
              </div>
            </TabsContent>

            {/* 판매자 로그인 탭 */}
            <TabsContent
              value="seller"
              className="space-y-4 mt-6"
            >
              <form
                onSubmit={handleSubmit(onSellerSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="seller-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seller-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="pl-10"
                      {...register("email", {
                        required: "이메일을 입력해주세요",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message:
                            "올바른 이메일 형식이 아닙니다",
                        },
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
                  <Label htmlFor="seller-password">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="seller-password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      className="pl-10"
                      {...register("password", {
                        required: "비밀번호를 입력해주세요",
                        minLength: {
                          value: 6,
                          message:
                            "비밀번호는 최소 6자 이상이어야 합니다",
                        },
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  로그인
                </Button>
              </form>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  계정이 없으신가요?{" "}
                </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={handleSignup}
                >
                  회원가입
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>테스트 계정:</p>
                <p>판매자: store@test.com</p>
                <p>관리자: admin@test.com</p>
                <p>비밀번호: 123456</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}