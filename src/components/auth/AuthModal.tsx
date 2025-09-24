'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginScreen from '@/components/LoginScreen';
import { SignupForm } from './SignupForm';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const { signIn } = useAuth();

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('로그인 실패:', error);
      } else {
        handleSuccess();
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleSignup = () => {
    setMode('signup');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {mode === 'login' ? '로그인' : '회원가입'}
          </DialogTitle>
        </DialogHeader>
        
        {mode === 'login' ? (
          <div className="p-4">
            <LoginScreen
              onLogin={handleLogin}
              onSignup={handleSignup}
            />
          </div>
        ) : (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
