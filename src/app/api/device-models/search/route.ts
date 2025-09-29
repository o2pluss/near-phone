import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/device-models/search - 단말기 모델 검색
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('device_models')
      .select('*')
      .or(`model.ilike.%${query}%,manufacturer.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('단말기 모델 검색 실패:', error);
      return NextResponse.json(
        { error: '단말기 모델 검색에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 데이터베이스 필드명을 프론트엔드 인터페이스에 맞게 변환
    const processedData = (data || []).map((item: any) => ({
      id: item.id,
      manufacturer: item.manufacturer,
      deviceName: item.device_name || item.model || 'Unknown Device',
      modelName: item.model_name || `MODEL-${item.id.substring(0, 8)}`,
      supportedCarriers: item.supported_carriers || [],
      supportedStorage: item.supported_storage || [],
      imageUrl: item.image_url,
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''
    }));

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
