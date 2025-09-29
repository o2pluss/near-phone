"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Package,
  Calendar,
  Bell,
  Users,
  Star,
  MessageSquare,
  Smartphone,
  Menu,
  X,
} from "lucide-react";

interface SellerDashboardMainProps {
  children: React.ReactNode;
}

export default function SellerDashboardMain({
  children,
}: SellerDashboardMainProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 오늘의 통계 데이터 (실제로는 API에서 가져와야 함)
  const todayStats = {
    totalReservations: 12,
    completedReservations: 8,
    pendingReservations: 4,
    revenue: 15000000,
  };

  const recentReservations = [
    {
      id: "1",
      customerName: "김고객",
      time: "14:30",
      model: "iPhone 15 Pro",
      status: "confirmed" as const,
    },
    {
      id: "2",
      customerName: "이사용",
      time: "11:00",
      model: "Galaxy S24 Ultra",
      status: "pending" as const,
    },
    {
      id: "3",
      customerName: "박고객",
      time: "16:00",
      model: "iPhone 15",
      status: "confirmed" as const,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/seller") {
      return pathname === "/seller/reservations";
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    { href: "/seller/reservations", icon: Calendar, label: "예약 관리" },
    { href: "/seller/schedule", icon: Calendar, label: "스케줄" },
    { href: "/seller/store-management", icon: Store, label: "매장 관리" },
    { href: "/seller/products", icon: Package, label: "상품 관리" },
    { href: "/seller/reviews", icon: Star, label: "리뷰 관리" },
    { href: "/seller/users", icon: Users, label: "회원 관리" },
    { href: "/seller/devices", icon: Smartphone, label: "단말기 등록" },
  ];

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="w-full p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}