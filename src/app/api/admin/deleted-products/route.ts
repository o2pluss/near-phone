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

// GET /api/admin/deleted-products - 삭제된 상품 목록 조회
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'products'; // 'products' or 'tables'
    const search = searchParams.get('search') || '';
    const deletionReason = searchParams.get('deletion_reason') || '';

    const offset = (page - 1) * limit;

    if (type === 'products') {
      // 삭제된 상품 조회
      let query = supabaseService
        .from('products')
        .select(`
          *,
          device_models!inner(
            id,
            manufacturer,
            model,
            image_url
          ),
          stores!inner(
            id,
            name,
            business_name
          ),
          product_tables(
            id,
            name
          )
        `, { count: 'exact' })
        .or('is_active.eq.false,deleted_at.not.is.null')
        .order('deleted_at', { ascending: false });

      // 검색 조건
      if (search) {
        query = query.or(`device_models.model.ilike.%${search}%,stores.name.ilike.%${search}%`);
      }

      if (deletionReason) {
        query = query.eq('deletion_reason', deletionReason);
      }

      // 페이지네이션
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('삭제된 상품 조회 실패:', error);
        return NextResponse.json(
          { error: '삭제된 상품 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        products: data || [],
        totalCount: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      });

    } else {
      // 삭제된 상품 테이블 조회
      let query = supabaseService
        .from('product_tables')
        .select(`
          *,
          stores!inner(
            id,
            name,
            business_name
          )
        `, { count: 'exact' })
        .or('is_active.eq.false,deleted_at.not.is.null')
        .order('deleted_at', { ascending: false });

      // 검색 조건
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (deletionReason) {
        query = query.eq('deletion_reason', deletionReason);
      }

      // 페이지네이션
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('삭제된 상품 테이블 조회 실패:', error);
        return NextResponse.json(
          { error: '삭제된 상품 테이블 조회에 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        tables: data || [],
        totalCount: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      });
    }

  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
