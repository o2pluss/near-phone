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
    { href: "/seller/products", icon: Package, label: "상품 관리" },
    { href: "/seller/reviews", icon: Star, label: "리뷰 관리" },
    { href: "/seller/users", icon: Users, label: "회원 관리" },
    { href: "/seller/devices", icon: Smartphone, label: "단말기 등록" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button Overlay */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="bg-white shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block border-t border-gray-200 bg-white">
        <div className="px-6">
          <nav className="flex space-x-8" style={{ padding: '16px 0' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-md ${
                    isActive(item.href)
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{ minWidth: '120px', textAlign: 'center' }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex">

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">메뉴</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}