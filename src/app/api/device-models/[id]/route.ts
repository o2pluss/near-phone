import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServerClient';

// GET /api/device-models/[id] - 특정 단말기 모델 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('device_models')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '단말기 모델을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('단말기 모델 조회 실패:', error);
      return NextResponse.json(
        { error: '단말기 모델 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 데이터베이스 필드명을 프론트엔드 인터페이스에 맞게 변환
    const processedData = {
      id: data.id,
      manufacturer: data.manufacturer,
      deviceName: data.device_name || data.model || 'Unknown Device',
      modelName: data.model_name || data.model || `MODEL-${data.id.substring(0, 8)}`,
      supportedCarriers: data.supported_carriers || [],
      supportedStorage: data.supported_storage || [],
      imageUrl: data.image_url,
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : ''
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/device-models/[id] - 단말기 모델 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const {
      manufacturer,
      device_name,
      model_name,
      supported_carriers,
      supported_storage,
      image_url
    } = body;

    // 필수 필드 검증
    if (!manufacturer || !supported_carriers || !supported_storage) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 스키마에 맞게 업데이트 (device_name, model_name이 없을 수 있음)
    const updateData: any = {
      manufacturer,
      supported_carriers,
      supported_storage,
      image_url: image_url || null,
      updated_at: new Date().toISOString()
    };

    // device_name과 model_name이 제공된 경우에만 추가
    if (device_name) {
      updateData.device_name = device_name;
    }
    if (model_name) {
      updateData.model_name = model_name;
    }

    const { data, error } = await supabase
      .from('device_models')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '단말기 모델을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('단말기 모델 수정 실패:', error);
      return NextResponse.json(
        { error: '단말기 모델 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 데이터베이스 필드명을 프론트엔드 인터페이스에 맞게 변환
    const processedData = {
      id: data.id,
      manufacturer: data.manufacturer,
      deviceName: data.device_name || data.model || 'Unknown Device',
      modelName: data.model_name || data.model || `MODEL-${data.id.substring(0, 8)}`,
      supportedCarriers: data.supported_carriers || [],
      supportedStorage: data.supported_storage || [],
      imageUrl: data.image_url,
      createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : ''
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/device-models/[id] - 단말기 모델 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;
    const body = await request.json();
    const { deletionType = 'soft_delete' } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: '단말기 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 삭제 타입에 따른 처리
    if (deletionType === 'soft_delete') {
      const { softDeleteDeviceModel } = await import('@/lib/api/deviceModels');
      const result = await softDeleteDeviceModel(deviceId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        message: result.message,
        deletionType: 'soft'
      });
    } else if (deletionType === 'force_delete') {
      const { forceDeleteDeviceModel } = await import('@/lib/api/deviceModels');
      const result = await forceDeleteDeviceModel(deviceId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        message: result.message,
        deletionType: 'force'
      });
    } else {
      return NextResponse.json(
        { error: '잘못된 삭제 타입입니다.' },
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
