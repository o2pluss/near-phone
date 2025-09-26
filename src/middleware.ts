import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 더 안전한 방법으로 사용자 인증 확인
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  console.log('=== 미들웨어 세션 체크 ===');
  console.log('Pathname:', req.nextUrl.pathname);
  console.log('User exists:', !!user);
  console.log('User ID:', user?.id);
  console.log('User error:', userError);
  
  // 브라우저에서 확인할 수 있도록 응답 헤더에 로그 추가
  response.headers.set('X-Middleware-Path', req.nextUrl.pathname);
  response.headers.set('X-Middleware-User', user ? 'true' : 'false');
  response.headers.set('X-Middleware-UserID', user?.id || 'none');

  // 권한별 라우트 정의
  const userRoutes = ['/main', '/search', '/detail', '/favorites', '/reservations', '/mypage', '/reviews'];
  const sellerRoutes = ['/seller', '/store-management', '/store-edit', '/schedule', '/reservation-detail'];
  const adminRoutes = ['/admin'];
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/kakao/callback', '/api/kakao', '/pending-approval', '/unauthorized', '/test-middleware'];

  const { pathname } = req.nextUrl;

  // 공개 라우트는 모든 사용자 접근 가능
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('공개 라우트, 접근 허용:', pathname);
    return response;
  }

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user || userError) {
    console.log('사용자 없음 또는 오류, /auth/login으로 리다이렉트');
    console.log('User error:', userError);
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 사용자 프로필에서 역할과 활성화 상태 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .single();

  console.log('=== 미들웨어 디버깅 ===');
  console.log('Pathname:', pathname);
  console.log('User ID:', user.id);
  console.log('Profile:', profile);

  if (!profile) {
    console.log('프로필 없음, /unauthorized로 리다이렉트');
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  const { role, is_active } = profile;
  console.log('Role:', role, 'Is Active:', is_active);

  // 사용자 라우트 체크
  if (userRoutes.some(route => pathname.startsWith(route))) {
    console.log('사용자 라우트 체크:', pathname, 'Role:', role);
    if (role !== 'user' && role !== 'admin') {
      console.log('사용자 권한 없음, /unauthorized로 리다이렉트');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    console.log('사용자 권한 확인됨, 접근 허용');
  }

  // 판매자 라우트 체크
  if (sellerRoutes.some(route => pathname.startsWith(route))) {
    if (role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // 판매자 계정이 승인되지 않은 경우
    if (role === 'seller' && !is_active) {
      return NextResponse.redirect(new URL('/pending-approval', req.url));
    }
  }

  // 관리자 라우트 체크
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    console.log('관리자 라우트 체크:', pathname, 'Role:', role);
    if (role !== 'admin') {
      console.log('관리자 권한 없음, /unauthorized로 리다이렉트');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    console.log('관리자 권한 확인됨, 접근 허용');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
