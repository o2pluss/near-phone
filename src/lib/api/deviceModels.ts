// 단말기 모델 삭제 관련 함수들

export interface DeviceDeletionImpact {
  productCount: number;
  reservationCount: number;
  reviewCount: number;
  favoriteCount: number;
  hasActiveProducts: boolean;
  hasUpcomingReservations: boolean;
}

export interface DeviceDeletionOptions {
  canSoftDelete: boolean;
  canForceDelete: boolean;
  recommendedAction: 'soft_delete' | 'force_delete' | 'cancel';
  impactMessage: string;
}

/**
 * 단말기 삭제 전 연관 데이터 영향도 분석
 */
export async function analyzeDeviceDeletionImpact(deviceId: string): Promise<DeviceDeletionImpact> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. 해당 단말기를 참조하는 상품 수
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('device_model_id', deviceId);

  // 2. 해당 상품들의 예약 수
  const { count: reservationCount } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .in('product_id', 
      (await supabase
        .from('products')
        .select('id')
        .eq('device_model_id', deviceId)
      ).data?.map(p => p.id) || []
    );

  // 3. 해당 예약들의 리뷰 수
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .in('reservation_id',
      (await supabase
        .from('reservations')
        .select('id')
        .in('product_id',
          (await supabase
            .from('products')
            .select('id')
            .eq('device_model_id', deviceId)
          ).data?.map(p => p.id) || []
        )
      ).data?.map(r => r.id) || []
    );

  // 4. 해당 상품들의 즐겨찾기 수
  const { count: favoriteCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .in('product_id',
      (await supabase
        .from('products')
        .select('id')
        .eq('device_model_id', deviceId)
      ).data?.map(p => p.id) || []
    );

  // 5. 활성 상품 여부
  const { data: activeProducts } = await supabase
    .from('products')
    .select('id')
    .eq('device_model_id', deviceId)
    .eq('is_active', true)
    .limit(1);

  // 6. 향후 예약 여부
  const today = new Date().toISOString().split('T')[0];
  const { data: upcomingReservations } = await supabase
    .from('reservations')
    .select('id')
    .in('product_id',
      (await supabase
        .from('products')
        .select('id')
        .eq('device_model_id', deviceId)
      ).data?.map(p => p.id) || []
    )
    .gte('reservation_date', today)
    .in('status', ['pending', 'confirmed'])
    .limit(1);

  return {
    productCount: productCount || 0,
    reservationCount: reservationCount || 0,
    reviewCount: reviewCount || 0,
    favoriteCount: favoriteCount || 0,
    hasActiveProducts: (activeProducts?.length || 0) > 0,
    hasUpcomingReservations: (upcomingReservations?.length || 0) > 0
  };
}

/**
 * 단말기 삭제 옵션 분석
 */
export function getDeviceDeletionOptions(impact: DeviceDeletionImpact): DeviceDeletionOptions {
  const hasAnyData = impact.productCount > 0 || impact.reservationCount > 0 || 
                    impact.reviewCount > 0 || impact.favoriteCount > 0;

  if (!hasAnyData) {
    return {
      canSoftDelete: false,
      canForceDelete: true,
      recommendedAction: 'force_delete',
      impactMessage: '연관된 데이터가 없어 안전하게 삭제할 수 있습니다.'
    };
  }

  if (impact.hasUpcomingReservations) {
    return {
      canSoftDelete: true,
      canForceDelete: false,
      recommendedAction: 'soft_delete',
      impactMessage: `향후 예약이 ${impact.reservationCount}개 있어 강제 삭제할 수 없습니다. 소프트 삭제를 권장합니다.`
    };
  }

  if (impact.hasActiveProducts) {
    return {
      canSoftDelete: true,
      canForceDelete: true,
      recommendedAction: 'soft_delete',
      impactMessage: `활성 상품 ${impact.productCount}개, 예약 ${impact.reservationCount}개, 리뷰 ${impact.reviewCount}개가 있습니다.`
    };
  }

  return {
    canSoftDelete: true,
    canForceDelete: true,
    recommendedAction: 'soft_delete',
    impactMessage: `과거 데이터가 ${impact.reservationCount}개 예약, ${impact.reviewCount}개 리뷰로 존재합니다.`
  };
}

/**
 * 단말기 소프트 삭제
 */
export async function softDeleteDeviceModel(deviceId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. 단말기 모델 비활성화
    const { error: deviceError } = await supabase
      .from('device_models')
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('id', deviceId);

    if (deviceError) throw deviceError;

    // 2. 관련 상품들 비활성화 (삭제 사유 기록)
    const { error: productsError } = await supabase
      .from('products')
      .update({ 
        is_active: false,
        deletion_reason: 'device_model_deleted'
      })
      .eq('device_model_id', deviceId);

    if (productsError) throw productsError;

    return {
      success: true,
      message: '단말기가 비활성화되었습니다. 관련 상품들도 함께 비활성화되었습니다.'
    };
  } catch (error) {
    console.error('소프트 삭제 실패:', error);
    return {
      success: false,
      message: '소프트 삭제에 실패했습니다.'
    };
  }
}

/**
 * 단말기 강제 삭제 (연관 데이터와 함께 완전 삭제)
 */
export async function forceDeleteDeviceModel(deviceId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. 관련 상품들의 예약 데이터 스냅샷 보존
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('device_model_id', deviceId);

    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      
      // 예약 데이터에 상품 스냅샷 저장
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id, product_id, product_snapshot')
        .in('product_id', productIds);

      if (reservations) {
        for (const reservation of reservations) {
          if (!reservation.product_snapshot) {
            // 상품 정보를 스냅샷으로 저장
            const { data: productData } = await supabase
              .from('products')
              .select(`
                id,
                price,
                conditions,
                device_models!inner(
                  manufacturer,
                  model,
                  device_name,
                  supported_carriers,
                  supported_storage
                )
              `)
              .eq('id', reservation.product_id)
              .single();

            if (productData) {
              await supabase
                .from('reservations')
                .update({ product_snapshot: productData })
                .eq('id', reservation.id);
            }
          }
        }
      }

      // 즐겨찾기 데이터에 상품 스냅샷 저장
      const { data: favorites } = await supabase
        .from('favorites')
        .select('id, product_id, product_snapshot')
        .in('product_id', productIds);

      if (favorites) {
        for (const favorite of favorites) {
          if (!favorite.product_snapshot) {
            const { data: productData } = await supabase
              .from('products')
              .select(`
                id,
                price,
                conditions,
                device_models!inner(
                  manufacturer,
                  model,
                  device_name,
                  supported_carriers,
                  supported_storage
                )
              `)
              .eq('id', favorite.product_id)
              .single();

            if (productData) {
              await supabase
                .from('favorites')
                .update({ product_snapshot: productData })
                .eq('id', favorite.id);
            }
          }
        }
      }
    }

    // 2. 단말기 모델 삭제 (CASCADE로 관련 데이터 자동 삭제)
    const { error } = await supabase
      .from('device_models')
      .delete()
      .eq('id', deviceId);

    if (error) throw error;

    return {
      success: true,
      message: '단말기와 관련 데이터가 완전히 삭제되었습니다. 예약과 즐겨찾기 데이터는 스냅샷으로 보존되었습니다.'
    };
  } catch (error) {
    console.error('강제 삭제 실패:', error);
    return {
      success: false,
      message: '강제 삭제에 실패했습니다.'
    };
  }
}

/**
 * 삭제된 단말기 모델 복구
 */
export async function restoreDeviceModel(deviceId: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. 단말기 모델 복구
    const { error: deviceError } = await supabase
      .from('device_models')
      .update({ 
        is_deleted: false, 
        deleted_at: null 
      })
      .eq('id', deviceId);

    if (deviceError) throw deviceError;

    // 2. 관련 상품들도 복구 (옵션)
    const { error: productsError } = await supabase
      .from('products')
      .update({ 
        is_active: true,
        deleted_at: null,
        deletion_reason: null
      })
      .eq('device_model_id', deviceId)
      .eq('deletion_reason', 'device_model_deleted');

    if (productsError) {
      console.warn('관련 상품 복구 실패:', productsError);
      // 단말기는 복구되었지만 상품 복구는 실패한 경우
      return {
        success: true,
        message: '단말기는 복구되었지만, 관련 상품 복구에 실패했습니다. 상품들을 수동으로 복구해주세요.'
      };
    }

    return {
      success: true,
      message: '단말기와 관련 상품들이 복구되었습니다.'
    };
  } catch (error) {
    console.error('단말기 복구 실패:', error);
    return {
      success: false,
      message: '단말기 복구에 실패했습니다.'
    };
  }
}

/**
 * 삭제된 단말기 모델 목록 조회
 */
export async function getDeletedDeviceModels(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    manufacturer: string;
    deviceName: string;
    modelName: string;
    supportedCarriers: string[];
    supportedStorage: string[];
    imageUrl?: string;
    deletedAt: string;
  }>;
  message?: string;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('device_models')
      .select('*')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    const processedData = (data || []).map((item: any) => ({
      id: item.id,
      manufacturer: item.manufacturer,
      deviceName: item.device_name || item.model || 'Unknown Device',
      modelName: item.model_name || `MODEL-${item.id.substring(0, 8)}`,
      supportedCarriers: item.supported_carriers || [],
      supportedStorage: item.supported_storage || [],
      imageUrl: item.image_url,
      deletedAt: item.deleted_at
    }));

    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('삭제된 단말기 조회 실패:', error);
    return {
      success: false,
      message: '삭제된 단말기 조회에 실패했습니다.'
    };
  }
}