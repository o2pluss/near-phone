import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// RLS 우회를 위한 서비스 키 클라이언트
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST /api/admin/restore - 삭제된 상품/테이블 복구
export async function POST(request: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '유효한 인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 토큰 유효성 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '토큰 검증에 실패했습니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, id, restoreChildren = false } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'type과 id가 필요합니다.' },
        { status: 400 }
      );
    }

    if (type === 'product') {
      // 상품 복구
      const { error } = await supabaseService
        .from('products')
        .update({
          is_active: true,
          deleted_at: null,
          deletion_reason: null
        })
        .eq('id', id);

      if (error) {
        console.error('상품 복구 실패:', error);
        return NextResponse.json(
          { error: '상품 복구에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: '상품이 복구되었습니다.',
        restoredAt: new Date().toISOString()
      });

    } else if (type === 'product_table') {
      // 상품 테이블 복구
      const { error: tableError } = await supabaseService
        .from('product_tables')
        .update({
          is_active: true,
          deleted_at: null,
          deletion_reason: null
        })
        .eq('id', id);

      if (tableError) {
        console.error('상품 테이블 복구 실패:', tableError);
        return NextResponse.json(
          { error: '상품 테이블 복구에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 관련 상품들도 복구 (옵션)
      if (restoreChildren) {
        const { error: productsError } = await supabaseService
          .from('products')
          .update({
            is_active: true,
            deleted_at: null,
            deletion_reason: null
          })
          .eq('table_id', id)
          .eq('deletion_reason', 'parent_table_deleted');

        if (productsError) {
          console.error('관련 상품 복구 실패:', productsError);
          // 테이블은 복구되었지만 상품 복구는 실패한 경우
          return NextResponse.json({
            message: '상품 테이블은 복구되었지만, 관련 상품 복구에 실패했습니다.',
            restoredAt: new Date().toISOString(),
            warning: '관련 상품들을 수동으로 복구해주세요.'
          });
        }
      }

      return NextResponse.json({
        message: '상품 테이블이 복구되었습니다.',
        restoredAt: new Date().toISOString(),
        childrenRestored: restoreChildren
      });

    } else {
      return NextResponse.json(
        { error: '지원하지 않는 타입입니다. (product, product_table)' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
