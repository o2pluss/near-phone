import React, { useState, useEffect } from 'react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { QueryProvider } from './providers/QueryProvider';
import { useAuthStore } from './stores/useAuthStore';
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
import { MapPin, Heart, Calendar, Search, Shield, Smartphone, User, Home } from 'lucide-react';

type Screen = 'login' | 'signup' | 'main' | 'search' | 'detail' | 'favorites' | 'reservations' | 'seller' | 'schedule' | 'reservation-detail' | 'admin' | 'mypage' | 'reviews';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [fromReservation, setFromReservation] = useState(false); // 예약에서 온 경우 구분
  const [reservationTab, setReservationTab] = useState<'upcoming' | 'past'>('upcoming'); // 예약 탭 상태 추가
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Check authentication state on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setCurrentScreen('admin');
      } else if (user.role === 'seller') {
        setCurrentScreen('seller');
      } else {
        setCurrentScreen('main');
      }
    }
  }, [isAuthenticated, user]);

  const handleLogin = (role: 'user' | 'seller' | 'admin') => {
    // Mock user data based on role
    const mockUser = {
      id: `${role}-${Date.now()}`,
      kakaoId: role === 'user' ? `kakao-${Date.now()}` : undefined,
      name: role === 'admin' ? '관리자' : role === 'seller' ? '판매자' : '햇살좋은날☀️',
      email: role === 'user' ? 'user@kakao.com' : `${role}@example.com`,
      phone: '010-1234-5678',
      role,
      loginType: role === 'user' ? 'kakao' as const : 'email' as const
    };
    
    login(mockUser);
    
    if (role === 'admin') {
      setCurrentScreen('admin');
    } else if (role === 'seller') {
      setCurrentScreen('seller');
    } else {
      setCurrentScreen('main');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} onSignup={() => setCurrentScreen('signup')} />;
      case 'signup':
        return <SignupScreen onBack={() => setCurrentScreen('login')} onSignup={handleLogin} />;
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
          reservation={selectedReservation}
          onBack={() => setCurrentScreen('seller')}
          onStatusUpdate={(reservationId, status) => {
            // 예약 상태 업데이트 로직
            console.log('Updating reservation:', reservationId, 'to status:', status);
            // 실제로는 API 호출이나 상태 관리를 통해 처리
            setCurrentScreen('seller');
          }}
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

  const showBottomNav = isAuthenticated && user && !['seller', 'admin'].includes(user.role);
  const showHeader = isAuthenticated && user && ['search', 'favorites', 'reservations', 'reviews'].includes(currentScreen);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Unified Header for user screens */}
      {showHeader && (
        <header className="border-b bg-card px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-lg text-blue-600">
                MobileFinder
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setCurrentScreen('mypage')}
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
      )}

      {/* Admin/Seller Header */}
      {isAuthenticated && user && ['admin', 'seller', 'schedule', 'reservation-detail'].includes(currentScreen) && (
        <header className="border-b bg-card px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-lg text-blue-600">
                MobileFinder
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                {user.name} ({user.role === 'admin' ? '관리자' : user.role === 'seller' ? '판매자' : '사용자'})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>

      {/* Bottom Navigation - Only for regular users */}
      {showBottomNav && (
        <nav className="bg-card border-t flex-shrink-0">
          <div className="flex">
            <Button
              variant={currentScreen === 'main' ? 'secondary' : 'ghost'}
              className="flex-1 flex-col h-16 rounded-none"
              onClick={() => setCurrentScreen('main')}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">홈</span>
            </Button>
            <Button
              variant={currentScreen === 'search' ? 'secondary' : 'ghost'}
              className="flex-1 flex-col h-16 rounded-none"
              onClick={() => setCurrentScreen('search')}
            >
              <Search className="h-5 w-5 mb-1" />
              <span className="text-xs">매장 찾기</span>
            </Button>
            <Button
              variant={currentScreen === 'favorites' ? 'secondary' : 'ghost'}
              className="flex-1 flex-col h-16 rounded-none"
              onClick={() => setCurrentScreen('favorites')}
            >
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs">즐겨찾기</span>
            </Button>
            <Button
              variant={currentScreen === 'reservations' ? 'secondary' : 'ghost'}
              className="flex-1 flex-col h-16 rounded-none"
              onClick={() => setCurrentScreen('reservations')}
            >
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs">예약 목록</span>
            </Button>
          </div>
        </nav>
      )}
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