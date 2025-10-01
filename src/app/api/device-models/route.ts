import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

// GET /api/device-models - 모든 단말기 모델 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const manufacturer = searchParams.get('manufacturer');
    const carrier = searchParams.get('carrier');
    const storage = searchParams.get('storage');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('device_models')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 필터링 조건 적용
    if (manufacturer) {
      query = query.eq('manufacturer', manufacturer);
    }
    if (carrier) {
      query = query.contains('supported_carriers', [carrier]);
    }
    if (storage) {
      query = query.contains('supported_storage', [storage]);
    }

    // 페이지네이션 적용
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('단말기 모델 조회 실패:', error);
      
      // 테이블이 없는 경우 빈 배열 반환
      if (error.code === 'PGRST205' || error.message?.includes('relation "device_models" does not exist')) {
        console.log('device_models 테이블이 없습니다. 빈 배열을 반환합니다.');
        return NextResponse.json([]);
      }
      
      // RLS 정책 문제인 경우 빈 배열 반환 (개발용)
      if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
        console.log('RLS 정책으로 인한 접근 거부. 빈 배열을 반환합니다.');
        return NextResponse.json([]);
      }
      
      return NextResponse.json(
        { error: '단말기 모델 조회에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 데이터베이스 필드명을 프론트엔드 인터페이스에 맞게 변환
    const processedData = (data || []).map((item: any) => ({
      id: item.id,
      manufacturer: item.manufacturer,
      deviceName: item.device_name || item.model || 'Unknown Device', // device_name이 없으면 model 사용, 그것도 없으면 기본값
      modelName: item.model_name || `MODEL-${item.id.substring(0, 8)}`, // model_name이 없으면 ID 기반 기본값
      supportedCarriers: item.supported_carriers || [],
      supportedStorage: item.supported_storage || [],
      imageUrl: item.image_url,
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''
    }));

    // 페이지네이션 응답
    const totalPages = Math.ceil((count || 0) / limit);
    const response = {
      data: processedData,
      total: count || 0,
      page,
      limit,
      totalPages
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/device-models - 새로운 단말기 모델 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      manufacturer,
      model,
      device_name,
      model_name,
      supported_carriers,
      supported_storage,
      image_url
    } = body;

    // 필수 필드 검증 (프론트엔드 사용 패턴에 맞게)
    if (!manufacturer || !device_name || !model_name || !supported_carriers || !supported_storage) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다. (manufacturer, device_name, model_name, supported_carriers, supported_storage 필수)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('device_models')
      .insert([{
        manufacturer,
        model: model || device_name || 'Unknown Model', // model이 없으면 device_name 사용, 그것도 없으면 기본값
        device_name,
        model_name,
        supported_carriers,
        supported_storage,
        image_url: image_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('단말기 모델 생성 실패:', error);
      
      // 테이블이 없는 경우 안내 메시지
      if (error.code === 'PGRST205' || error.message?.includes('relation "device_models" does not exist')) {
        return NextResponse.json(
          { error: 'device_models 테이블이 존재하지 않습니다. 데이터베이스 스키마를 확인해주세요.' },
          { status: 500 }
        );
      }
      
      // RLS 정책 문제인 경우 안내 메시지
      if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { error: 'RLS 정책으로 인한 접근 거부. 데이터베이스 권한을 확인해주세요.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: '단말기 모델 생성에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    // 데이터베이스 필드명을 프론트엔드 인터페이스에 맞게 변환
    const processedData = {
      id: data.id,
      manufacturer: data.manufacturer,
      deviceName: data.device_name || data.model || 'Unknown Device',
      modelName: data.model_name || `MODEL-${data.id.substring(0, 8)}`,
      supportedCarriers: data.supported_carriers || [],
      supportedStorage: data.supported_storage || [],
      imageUrl: data.image_url,
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : ''
    };

    return NextResponse.json(processedData, { status: 201 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
