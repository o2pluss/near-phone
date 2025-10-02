'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import UserManagement from '@/components/admin/UserManagement';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/auth/login');
      return;
    }

    if (!loading && profile && profile.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return <PageLoadingSpinner text="로딩 중..." />;
  }

  if (!user || !profile) {
    return null; // 리다이렉트 중
  }

  if (profile.role !== 'admin') {
    return null; // 리다이렉트 중
  }

  return <UserManagement />;
}
