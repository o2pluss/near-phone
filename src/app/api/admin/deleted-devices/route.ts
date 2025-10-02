import { NextRequest, NextResponse } from 'next/server';
import { getDeletedDeviceModels } from '@/lib/api/deviceModels';

// GET /api/admin/deleted-devices - 삭제된 단말기 모델 목록 조회
export async function GET(request: NextRequest) {
  try {
    const result = await getDeletedDeviceModels();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      devices: result.data || [],
      totalCount: result.data?.length || 0
    });
  } catch (error) {
    console.error('삭제된 단말기 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
