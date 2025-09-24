'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export { useAuth } from '@/contexts/AuthContext';

// 추가적인 인증 관련 훅들
export function useRequireAuth() {
  const { user, loading } = useAuthContext();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isUnauthenticated: !user && !loading,
  };
}

export function useRequireRole(requiredRole: 'user' | 'seller' | 'admin') {
  const { user, profile, loading } = useAuthContext();
  
  const hasRole = profile?.role === requiredRole || profile?.role === 'admin';
  const isAuthenticated = !!user;
  
  return {
    user,
    profile,
    loading,
    isAuthenticated,
    hasRole,
    canAccess: isAuthenticated && hasRole,
  };
}
