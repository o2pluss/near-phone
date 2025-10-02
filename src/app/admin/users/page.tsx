'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // 리다이렉트 중
  }

  if (profile.role !== 'admin') {
    return null; // 리다이렉트 중
  }

  return <UserManagement />;
}
