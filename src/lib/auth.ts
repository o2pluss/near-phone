// 인증 관련 유틸리티 함수들

import { supabase } from './supabaseClient';

// 현재 사용자 세션 가져오기
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('세션 가져오기 실패:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('getCurrentSession 오류:', error);
    return null;
  }
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser() {
  try {
    const session = await getCurrentSession();
    return session?.user || null;
  } catch (error) {
    console.error('getCurrentUser 오류:', error);
    return null;
  }
}

// 인증된 사용자인지 확인
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// 세션 초기화 (브라우저 새로고침 시)
export async function initializeSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('세션 초기화 실패:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('세션 초기화 오류:', error);
    return null;
  }
}

// 로그아웃
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 실패:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return false;
  }
}

// 세션 강제 새로고침 (문제 해결용)
export async function forceRefreshSession() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('현재 세션 확인 실패:', sessionError);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('세션 새로고침 실패:', refreshError);
      return null;
    }
    
    return refreshedSession;
  } catch (error) {
    console.error('세션 강제 새로고침 오류:', error);
    return null;
  }
}

// 디버깅용 인증 상태 확인
export async function debugAuthState() {
  try {
    console.log('=== 인증 상태 디버깅 ===');
    
    // 1. 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('1. 세션 상태:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasRefreshToken: !!session?.refresh_token,
      user: session?.user?.id,
      expiresAt: session?.expires_at,
      error: sessionError?.message
    });
    
    // 2. 쿠키 확인 (브라우저에서만)
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      console.log('2. 쿠키 상태:', {
        supabaseAuthToken: !!cookies['sb-near-phone-auth-token'],
        supabaseAuthRefreshToken: !!cookies['sb-near-phone-auth-token-code-verifier'],
        allCookies: Object.keys(cookies).filter(key => key.includes('supabase') || key.includes('auth'))
      });
    }
    
    // 3. 로컬 스토리지 확인 (브라우저에서만)
    if (typeof window !== 'undefined') {
      const localStorage = window.localStorage;
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
      console.log('3. 로컬 스토리지 상태:', {
        supabaseKeys,
        hasAuthData: supabaseKeys.some(key => key.includes('auth'))
      });
    }
    
    return {
      session,
      sessionError,
      hasValidSession: !!session?.access_token
    };
  } catch (error) {
    console.error('디버깅 중 오류:', error);
    return {
      session: null,
      sessionError: error,
      hasValidSession: false
    };
  }
}

// API 요청용 인증 헤더 가져오기
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getCurrentSession();
  
  if (!session?.access_token) {
    throw new Error('로그인이 필요합니다.');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}
