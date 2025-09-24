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

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginScreenProps {
  onLogin: (role: "user" | "seller" | "admin") => void;
  onSignup: () => void;
}

export default function LoginScreen({
  onLogin,
  onSignup,
}: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState("user");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>();

  const onSellerSubmit = (data: LoginFormData) => {
    // Mock login logic for seller
    console.log("Seller login data:", data);

    // Demo: admin account
    if (data.email === "admin@example.com") {
      onLogin("admin");
    } else {
      onLogin("seller");
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with ${provider}`);
    onLogin("user");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    reset(); // Clear form when switching tabs
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Smartphone className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            로그인
          </h1>
          <p className="text-muted-foreground">
            내 주변 휴대폰 판매점을 찾아보세요
          </p>
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
                <User className="h-4 w-4" />
                <span>사용자</span>
              </TabsTrigger>
              <TabsTrigger
                value="seller"
                className="flex items-center space-x-2"
              >
                <Store className="h-4 w-4" />
                <span>판매자</span>
              </TabsTrigger>
            </TabsList>

            {/* 사용자 로그인 탭 */}
            <TabsContent
              value="user"
              className="space-y-4 mt-6"
            >
              <div className="text-center space-y-4">
                <div className="space-y-3">
                  <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                    onClick={() => handleSocialLogin("kakao")}
                  >
                    <div className="mr-2 h-4 w-4 bg-yellow-600 rounded" />
                    카카오로 로그인
                  </Button>
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
                  onClick={onSignup}
                >
                  회원가입
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>데모 계정:</p>
                <p>판매자: seller@example.com</p>
                <p>관리자: admin@example.com</p>
                <p>비밀번호: 123456</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}