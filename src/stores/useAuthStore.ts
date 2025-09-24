import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  kakaoId?: string; // 카카오 고유 ID (일반 사용자만)
  name: string; // 카카오 닉네임 또는 실명
  email: string; // 카카오 이메일
  phone: string; // 카카오 휴대폰 번호
  role: 'user' | 'seller' | 'admin';
  loginType?: 'kakao' | 'email'; // 로그인 방식 구분
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);