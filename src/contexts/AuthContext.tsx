'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
  user_id: string;
  role: 'user' | 'seller' | 'admin';
  name: string | null;
  phone: string | null;
  login_type: 'kakao' | 'email';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithKakao: (kakaoUserInfo: { id: string; nickname: string; profile_image?: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Initial session user, creating temporary profile for:', session.user.id);
        try {
          // 실제 프로필 로드 또는 생성
          const userProfile = await fetchUserProfile(session.user);
          console.log('초기 프로필 로드 완료, 설정 중:', userProfile);
          setProfile(userProfile);
          console.log('초기 프로필 설정 완료');
        } catch (error) {
          console.error('초기 프로필 로드 중 오류:', error);
          // 오류가 발생해도 기본 프로필 생성
          const fallbackProfile = {
            user_id: session.user.id,
            role: 'user' as const,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
            phone: session.user.user_metadata?.phone || null,
            login_type: 'email' as const,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          console.log('초기 폴백 프로필 설정:', fallbackProfile);
          setProfile(fallbackProfile);
        } finally {
          setLoading(false);
          console.log('초기 로딩 상태 false로 설정');
        }
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', { event, session: !!session, user: !!session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, creating temporary profile for:', session.user.id);
        try {
          // 실제 프로필 로드 또는 생성
          const userProfile = await fetchUserProfile(session.user);
          console.log('프로필 로드 완료, 설정 중:', userProfile);
          setProfile(userProfile);
          console.log('프로필 설정 완료');
        } catch (error) {
          console.error('프로필 로드 중 오류:', error);
          // 오류가 발생해도 기본 프로필 생성
          const fallbackProfile = {
            user_id: session.user.id,
            role: 'user' as const,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
            phone: session.user.user_metadata?.phone || null,
            login_type: 'email' as const,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          console.log('폴백 프로필 설정:', fallbackProfile);
          setProfile(fallbackProfile);
        } finally {
          setLoading(false);
          console.log('로딩 상태 false로 설정');
        }
      } else {
        console.log('User not authenticated, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: any) => {
    console.log('fetchUserProfile 시작:', user.id);
    
    // user_metadata에서 역할 가져오기
    const role = user.user_metadata?.role || 'user';
    
    const profile = {
      user_id: user.id,
      role: role,
      name: user.user_metadata?.name || user.email?.split('@')[0] || '사용자',
      phone: user.user_metadata?.phone || null,
      login_type: 'email' as const,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('프로필 생성 완료:', profile);
    return profile;
  };

  const fetchProfile = async (userId: string) => {
    console.log('fetchProfile called with userId:', userId);
    try {
      console.log('Making Supabase query...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Profile fetch result:', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);
        
        // 프로필이 없으면 기본 프로필 생성
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          await createDefaultProfile(userId);
        } else {
          console.log('Other error, setting profile to null');
          setProfile(null);
        }
      } else {
        console.log('Profile found, setting profile:', data);
        setProfile(data);
        console.log('Profile set successfully');
      }
    } catch (error) {
      console.error('Exception in fetchProfile:', error);
      setProfile(null);
    } finally {
      console.log('fetchProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    console.log('createDefaultProfile called with userId:', userId);
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Current user data:', user);
      
      if (!user.user) {
        console.log('No user found, returning');
        return;
      }

      // 이메일을 기반으로 역할 결정
      let role: 'user' | 'seller' | 'admin' = 'user';
      const email = user.user.email?.trim().toLowerCase();
      if (email?.includes('admin')) {
        role = 'admin';
      } else if (email?.includes('seller') || email?.startsWith('store')) {
        role = 'seller';
      }

      const profileData = {
        user_id: userId,
        role: role,
        name: user.user.user_metadata?.name || user.user.email?.split('@')[0] || '사용자',
        phone: user.user.user_metadata?.phone || null,
        login_type: 'email',
        is_active: true,
      };
      
      console.log('Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      console.log('Profile creation result:', { data, error });

      if (error) {
        console.error('Error creating profile:', error);
        setProfile(null);
      } else {
        console.log('Default profile created successfully:', data);
        setProfile(data);
        console.log('Default profile set successfully');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            role: userData?.role || 'user',
            name: userData?.name || null,
            phone: userData?.phone || null,
            login_type: 'email',
            is_active: true,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError as unknown as AuthError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('signIn called with email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in result:', { data, error });
      
      if (error) {
        console.log('Sign in error:', error);
        return { error };
      }
      
      // 프로필 로드는 onAuthStateChange에서 처리됨
      console.log('Sign in successful, profile will be loaded by onAuthStateChange');
      
      return { error: null };
    } catch (error) {
      console.log('Sign in exception:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithKakao = async (kakaoUserInfo: { id: string; nickname: string; profile_image?: string }) => {
    try {
      const email = `kakao_${kakaoUserInfo.id}@kakao.local`;
      // 고정 비밀번호 전략 (서버 환경변수로 솔트 가능)
      const stablePassword = `kakao_${kakaoUserInfo.id}_oauth_password`;

      // 1) 먼저 로그인 시도
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: stablePassword,
      });

      if (!signInError) {
        // 프로필 upsert (보조 동기화)
        await supabase
          .from('profiles')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id as string,
            role: 'user',
            name: kakaoUserInfo.nickname,
            phone: null,
            login_type: 'kakao',
            is_active: true,
          }, { onConflict: 'user_id' });
        return { error: null };
      }

      // 2) 존재하지 않거나 비밀번호 불일치 → 동일 비밀번호로 가입 시도
      if (signInError && signInError.message?.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: stablePassword,
          options: {
            data: {
              name: kakaoUserInfo.nickname,
              profile_image: kakaoUserInfo.profile_image,
              login_type: 'kakao',
            },
          },
        });

        // 이미 존재(422) 또는 기타 제약 발생 시 재로그인 시도
        if (signUpError) {
          // 이메일 존재 또는 유사 케이스는 재로그인으로 처리
          const { error: retryErr } = await supabase.auth.signInWithPassword({
            email,
            password: stablePassword,
          });
          if (retryErr) return { error: retryErr as AuthError };
        }

        // 프로필 upsert
        if (signUpData?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: signUpData.user.id,
              role: 'user',
              name: kakaoUserInfo.nickname,
              phone: null,
              login_type: 'kakao',
              is_active: true,
            }, { onConflict: 'user_id' });

          if (profileError) {
            console.error('카카오 프로필 upsert 오류:', profileError);
            // 프로필 오류는 로그인 자체를 막지 않음
          }
        }

        return { error: null };
      }

      // 그 외 에러 전달
      return { error: signInError as AuthError };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') as AuthError };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) return { error: error as unknown as AuthError };

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithKakao,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
