// 카카오 로그인 유틸리티 함수들

declare global {
  interface Window {
    Kakao: any;
  }
}

// 카카오 SDK 초기화
export const initKakao = () => {
  if (typeof window !== 'undefined') {
    console.log('카카오 SDK 초기화 시도...');
    console.log('window.Kakao 존재:', !!window.Kakao);
    
    if (window.Kakao && !window.Kakao.isInitialized()) {
      const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
      console.log('앱 키 존재:', !!appKey);
      
      if (appKey) {
        window.Kakao.init(appKey);
        console.log('카카오 SDK 초기화 완료');
        console.log('Kakao.Auth 존재:', !!window.Kakao.Auth);
        console.log('Kakao.Auth.login 존재:', !!(window.Kakao.Auth && window.Kakao.Auth.login));
      } else {
        console.error('카카오 앱 키가 설정되지 않았습니다.');
      }
    } else if (window.Kakao && window.Kakao.isInitialized()) {
      console.log('카카오 SDK가 이미 초기화됨');
    } else {
      console.log('카카오 SDK가 아직 로드되지 않음');
    }
  }
};

// 카카오 SDK 로딩 대기
export const waitForKakao = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('브라우저 환경이 아닙니다.'));
      return;
    }

    const checkKakao = () => {
      console.log('카카오 SDK 상태 확인...');
      console.log('window.Kakao 존재:', !!window.Kakao);
      
      if (window.Kakao) {
        console.log('Kakao.isInitialized():', window.Kakao.isInitialized());
        console.log('Kakao.Auth 존재:', !!window.Kakao.Auth);
        
        if (window.Kakao.isInitialized() && window.Kakao.Auth) {
          console.log('Kakao.Auth.login 존재:', !!(window.Kakao.Auth.login));
          resolve();
          return;
        }
      }
      
      setTimeout(checkKakao, 100);
    };

    // 최대 10초 대기
    setTimeout(() => {
      console.error('카카오 SDK 로딩 시간 초과');
      console.log('최종 상태:', {
        Kakao: !!window.Kakao,
        isInitialized: window.Kakao?.isInitialized(),
        Auth: !!window.Kakao?.Auth,
        login: !!(window.Kakao?.Auth?.login)
      });
      reject(new Error('카카오 SDK 로딩 시간 초과'));
    }, 10000);

    checkKakao();
  });
};

// 카카오 로그인 실행 (리다이렉트 방식)
export const loginWithKakao = async () => {
  try {
    // 카카오 SDK 로딩 대기
    await waitForKakao();
    
    if (typeof window === 'undefined' || !window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다.');
    }

    // Auth.authorize 함수 존재 확인
    if (!window.Kakao.Auth || typeof window.Kakao.Auth.authorize !== 'function') {
      throw new Error('카카오 Auth.authorize 함수를 찾을 수 없습니다.');
    }

    console.log('카카오 로그인 리다이렉트 시작 (JS SDK authorize)');

    const isMobile = () => {
      if (typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || '';
      return /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Mobile/i.test(ua);
    };

    if (isMobile()) {
      // 모바일: 카카오톡 앱 우선
      window.Kakao.Auth.authorize({
        redirectUri: `${window.location.origin}/auth/kakao/callback`,
        throughTalk: true,
      });
    } else {
      // 데스크톱: SDK 우회, 웹 인가 URL로 직접 이동 (intent 회피)
      const clientId = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
      const redirectUri = `${window.location.origin}/auth/kakao/callback`;
      const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(
        clientId || ''
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
      window.location.href = authUrl;
    }

    // 리다이렉트되므로 여기까지 도달하지 않음
    return Promise.resolve();
  } catch (error) {
    throw error;
  }
};

// 카카오 로그아웃
export const logoutWithKakao = () => {
  if (typeof window !== 'undefined' && window.Kakao) {
    window.Kakao.Auth.logout();
  }
};
