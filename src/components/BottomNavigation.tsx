'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Home, Search, Heart, Calendar } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  // 특정 페이지에서는 하단 네비게이션 숨김
  const hiddenPaths = [
    '/seller',           // 판매자 페이지
    '/pending-approval', // 승인 대기 페이지
    '/unauthorized',     // 권한 없음 페이지
    '/admin',           // 관리자 페이지    // 로그인 페이지
    '/auth/signup',     // 회원가입 페이지
  ];
  
  if (hiddenPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  const navItems = [
    {
      id: 'main',
      href: '/',
      icon: Home,
      label: '홈',
    },
    {
      id: 'search',
      href: '/search',
      icon: Search,
      label: '매장 찾기',
    },
    {
      id: 'favorites',
      href: '/favorites',
      icon: Heart,
      label: '즐겨찾기',
    },
    {
      id: 'reservations',
      href: '/reservations',
      icon: Calendar,
      label: '예약 목록',
    },
  ];

  return (
    <nav className="bg-card border-t flex-shrink-0 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.id} href={item.href} className="flex-1">
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full flex-col h-16 rounded-none"
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
