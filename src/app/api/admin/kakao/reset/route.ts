import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'email, password는 필수입니다.' }, { status: 400 });
    }

    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

    if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: '서버 환경변수 미설정(SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL).' }, { status: 500 });
    }

    const authBase = SUPABASE_URL.replace(/\/?$/, '') + '/auth/v1';

    // 1) 이메일로 사용자 조회
    const findRes = await fetch(`${authBase}/admin/users?email=${encodeURIComponent(email)}`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (!findRes.ok) {
      const errText = await findRes.text();
      console.error('관리자 사용자 조회 실패:', errText);
      return NextResponse.json({ error: `관리자 사용자 조회 실패: ${errText}` }, { status: 400 });
    }

    const list = await findRes.json();
    const user = Array.isArray(list?.users) ? list.users[0] : (Array.isArray(list) ? list[0] : null);

    if (!user?.id) {
      return NextResponse.json({ error: '해당 이메일 사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2) 비밀번호 재설정
    const patchRes = await fetch(`${authBase}/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      console.error('관리자 비밀번호 재설정 실패:', errText);
      return NextResponse.json({ error: `비밀번호 재설정 실패: ${errText}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('관리자 비밀번호 재설정 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}


