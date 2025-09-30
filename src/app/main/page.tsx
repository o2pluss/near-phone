'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainScreen from '@/components/MainScreen';

export default function MainPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleSearch = () => {
    router.push('/search');
  };

  const handleReviews = () => {
    if (user && profile) {
      router.push('/reviews');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <MainScreen 
      onSearch={handleSearch}
      onReviews={handleReviews}
      user={user}
      profile={profile}
    />
  );
}
