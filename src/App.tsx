import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { QueryProvider } from './providers/QueryProvider';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import MainScreen from './components/MainScreen';
import StoreSearchScreen from './components/StoreSearchScreen';
import StoreDetail from './components/StoreDetail';
import FavoriteStores from './components/FavoriteStores';
import ReservationList from './components/ReservationList';
import SellerDashboard from './components/SellerDashboard';
import SellerSchedule from './components/SellerSchedule';
import ReservationDetail from './components/seller/ReservationDetail';
import AdminDashboard from './components/AdminDashboard';
import MyPage from './components/MyPage';
import ReviewListPage from './components/ReviewListPage';
import { Header } from './components/Header';
import { MapPin, Heart, Calendar, Search, Shield, Smartphone, User, Home } from 'lucide-react';

type Screen = 'login' | 'signup' | 'main' | 'search' | 'detail' | 'favorites' | 'reservations' | 'seller' | 'schedule' | 'reservation-detail' | 'admin' | 'mypage' | 'reviews';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [fromReservation, setFromReservation] = useState(false); // 예약에서 온 경우 구분
  const [reservationTab, setReservationTab] = useState<'upcoming' | 'past'>('upcoming'); // 예약 탭 상태 추가
  const { user, profile, loading, signOut, signIn } = useAuth();

  // Check authentication state on mount
  useEffect(() => {
    console.log('=== App.tsx Auth state changed ===');
    console.log('User:', !!user, user?.id);
    console.log('Profile:', !!profile, profile?.role);
    console.log('Loading:', loading);
    console.log('Current screen:', currentScreen);
    
    if (loading) {
      console.log('Still loading...');
      return;
    }
    
    if (user && profile) {
      console.log('✅ User and profile loaded, role:', profile.role);
      if (profile.role === 'admin') {
        console.log('🔄 Switching to admin screen');
        setCurrentScreen('admin');
      } else if (profile.role === 'seller') {
        console.log('🔄 Switching to seller screen');
        setCurrentScreen('seller');
      } else {
        console.log('🔄 Switching to main screen');
        setCurrentScreen('main');
      }
    } else if (user && !profile) {
      console.log('⚠️ User authenticated but profile not loaded yet');
    } else {
      console.log('❌ User not authenticated');
    }
  }, [user, profile, loading]);

  const handleLogin = async (email: string, password: string) => {
    console.log('Login attempt:', email);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('로그인 실패:', error);
      } else {
        console.log('로그인 성공, 프로필 로딩 대기 중...');
      }
      // 화면 전환은 useEffect에서 처리됨
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentScreen('login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} onSignup={() => setCurrentScreen('signup')} />;
      case 'signup':
        return <SignupScreen onBack={() => setCurrentScreen('login')} onSignup={() => {}} />;
      case 'main':
        return <MainScreen 
          onSearch={() => setCurrentScreen('search')}
          onReviews={() => setCurrentScreen('reviews')}
        />;
      case 'search':
        return <StoreSearchScreen 
          onStoreSelect={(store) => {
            setSelectedStore(store);
            setFromReservation(false);
            setCurrentScreen('detail');
          }}
          onBack={() => setCurrentScreen('main')}
        />; 
      case 'detail':
        return selectedStore?.id ? (
          <StoreDetail 
            storeId={selectedStore.id} 
            onBack={() => setCurrentScreen(fromReservation ? 'reservations' : 'search')}
            hideConditionsAndBooking={fromReservation}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg text-red-600">매장 정보를 찾을 수 없습니다.</div>
              <Button onClick={() => setCurrentScreen('search')} className="mt-4">
                매장 목록으로 돌아가기
              </Button>
            </div>
          </div>
        );
      case 'favorites':
        return <FavoriteStores onStoreSelect={(store) => {
          setSelectedStore(store);
          setFromReservation(false);
          setCurrentScreen('detail');
        }} />;
      case 'reservations':
        return <ReservationList 
          currentTab={reservationTab}
          onTabChange={setReservationTab}
          onStoreSelect={(store) => {
            setSelectedStore(store);
            setFromReservation(true);
            setCurrentScreen('detail');
          }} 
        />; 
      case 'seller':
        return <SellerDashboard 
          onScheduleView={() => setCurrentScreen('schedule')}
          onReservationDetail={(reservation) => {
            setSelectedReservation(reservation);
            setCurrentScreen('reservation-detail');
          }}
        />;
      case 'schedule':
        return <SellerSchedule onBack={() => setCurrentScreen('seller')} />;
      case 'reservation-detail':
        return <ReservationDetail 
          reservationId={selectedReservation?.id || ''}
          onBack={() => setCurrentScreen('seller')}
        />;
      case 'admin':
        return <AdminDashboard />;
      case 'mypage':
        return <MyPage 
          onBack={() => setCurrentScreen('main')} 
          onLogout={handleLogout}
        />;
      case 'reviews':
        return <ReviewListPage 
          onBack={() => setCurrentScreen('main')}
        />; 
      default:
        return <LoginScreen onLogin={handleLogin} onSignup={() => setCurrentScreen('signup')} />;
    }
  };

  const showHeader = false; // 전역 레이아웃에서 Header 렌더링

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header는 전역 레이아웃에서 렌더링됨 */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>

      {/* BottomNavigation은 전역 레이아웃에서 렌더링됨 */}
    </div>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}