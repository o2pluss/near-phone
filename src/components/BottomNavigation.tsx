'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Home, Search, Heart, Calendar } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

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
    <nav className="bg-card border-t flex-shrink-0">
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
