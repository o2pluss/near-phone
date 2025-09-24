import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: '인증 코드가 필요합니다.' }, { status: 400 });
    }

    // 카카오 액세스 토큰 발급 (REST API 키 사용)
    const REST_API_KEY = process.env.KAKAO_REST_API_KEY as string;
    const CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET as string | undefined;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!REST_API_KEY) {
      console.error('KAKAO_REST_API_KEY 미설정');
      return NextResponse.json({ error: '서버 설정 오류(KAKAO_REST_API_KEY).' }, { status: 500 });
    }

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {} as any),
        redirect_uri: `${APP_URL}/auth/kakao/callback`,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('카카오 토큰 발급 실패:', error);
      console.error('요청 데이터(요약):', {
        client_id_present: !!REST_API_KEY,
        client_secret_present: !!CLIENT_SECRET,
        redirect_uri: `${APP_URL}/auth/kakao/callback`,
      });
      return NextResponse.json({ error: `토큰 발급에 실패했습니다: ${error}` }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 카카오 사용자 정보 조회
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error('카카오 사용자 정보 조회 실패:', error);
      return NextResponse.json({ error: '사용자 정보 조회에 실패했습니다.' }, { status: 400 });
    }

    const userData = await userResponse.json();

    // 사용자 정보 정리
    const userInfo = {
      id: userData.id.toString(),
      nickname: userData.properties?.nickname || userData.kakao_account?.profile?.nickname,
      profile_image: userData.properties?.profile_image || userData.kakao_account?.profile?.profile_image_url,
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('카카오 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
