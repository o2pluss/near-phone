"use client";

import MyPage from "@/components/MyPage";
import { useRouter } from "next/navigation";

export default function MyPageRoute() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    // 로그아웃 로직 (필요시 구현)
    router.push('/');
  };

  return <MyPage onBack={handleBack} onLogout={handleLogout} />;
}


