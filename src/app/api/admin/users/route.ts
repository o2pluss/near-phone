import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServerClient';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 어드민 API이므로 서비스 역할 키를 사용하여 RLS 우회
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // auth.users 테이블에서 모든 사용자 조회 (서비스 역할 키로 RLS 우회)
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`사용자 조회 오류: ${usersError.message}`);
    }

    const allUsers = usersData?.users || [];

    // profiles 테이블에서 추가 정보 조회
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, role, name, phone, is_active, created_at, updated_at');

    if (profilesError) {
      throw new Error(`프로필 조회 오류: ${profilesError.message}`);
    }

    // 사용자 데이터와 프로필 데이터 결합
    const combinedUsers = allUsers.map(user => {
      const profile = profilesData?.find(p => p.user_id === user.id);
      return {
        id: user.id,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || '이름 없음',
        email: user.email || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        role: profile?.role || user.user_metadata?.role || 'user',
        status: profile?.is_active === false ? 'blocked' : 'active',
        createdAt: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : new Date(user.created_at).toISOString().split('T')[0],
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }) : '없음',
      };
    });

    // 필터링 적용
    let filteredUsers = combinedUsers;

    // 검색 조건
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search)
      );
    }

    // 역할 필터
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // 상태 필터
    if (status === 'blocked') {
      filteredUsers = filteredUsers.filter(user => user.status === 'blocked');
    } else if (status === 'active') {
      filteredUsers = filteredUsers.filter(user => user.status === 'active');
    }

    // 총 개수
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);

    // 페이지네이션 적용
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedUsers = filteredUsers.slice(from, to);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 어드민 API이므로 서비스 역할 키를 사용하여 RLS 우회
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 차단/해제 처리 (profiles 테이블의 is_active 필드 사용)
    if (action === 'block') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`사용자 차단 오류: ${error.message}`);
      }
    } else if (action === 'unblock') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: true })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`사용자 차단 해제 오류: ${error.message}`);
      }
    } else {
      return NextResponse.json(
        { error: '잘못된 액션입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'block' ? '사용자가 차단되었습니다.' : '사용자 차단이 해제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 상태 변경 오류:', error);
    return NextResponse.json(
      { error: '사용자 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
