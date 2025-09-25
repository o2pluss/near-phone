'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, LogIn, Menu, X } from 'lucide-react';

export function Header() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // 판매자 페이지인지 확인
  const isSellerPage = pathname.startsWith('/seller');

  const handleUserIconClick = () => {
    router.push('/mypage');
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
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Near Phone</span>
          </Link>

          {/* Right: User Icon or Login Button */}
          <div className="flex items-center">
            {user && profile ? (
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
                onClick={handleUserIconClick}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={profile.name || 'User'} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
}
