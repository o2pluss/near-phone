import { NextRequest, NextResponse } from 'next/server';
import { restoreDeviceModel } from '@/lib/api/deviceModels';

// POST /api/device-models/[id]/restore - 삭제된 단말기 모델 복구
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = params.id;

    if (!deviceId) {
      return NextResponse.json(
        { error: '단말기 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await restoreDeviceModel(deviceId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: result.message,
      restoredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('단말기 복구 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
