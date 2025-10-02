import { NextRequest, NextResponse } from 'next/server';
import { analyzeDeviceDeletionImpact, getDeviceDeletionOptions } from '@/lib/api/deviceModels';

// GET /api/device-models/[id]/deletion-impact - 단말기 삭제 영향도 분석
export async function GET(
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

    // 삭제 영향도 분석
    const impact = await analyzeDeviceDeletionImpact(deviceId);
    
    // 삭제 옵션 분석
    const options = getDeviceDeletionOptions(impact);

    return NextResponse.json({
      impact,
      options
    });
  } catch (error) {
    console.error('삭제 영향도 분석 오류:', error);
    return NextResponse.json(
      { error: '삭제 영향도 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
