// 환경별 설정 관리

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  // Supabase 설정
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // 보안 설정
  security: {
    // 개발 환경에서는 RLS 우회 허용
    bypassRLS: isDevelopment,
    // 프로덕션에서는 엄격한 인증 요구
    requireEmailVerification: isProduction,
    // 로그 레벨
    logLevel: isDevelopment ? 'debug' : 'error',
  },
  
  // API 설정
  api: {
    // 요청 타임아웃
    timeout: isProduction ? 10000 : 30000,
    // 재시도 횟수
    retryAttempts: isProduction ? 3 : 1,
  }
};

// 환경 변수 검증
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
