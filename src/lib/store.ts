import { supabase } from './supabaseClient';
import { uploadStoreImages, deleteStoreImages, convertLocalToServerImages, getNewLocalImages } from './imageUpload';

export interface StoreInfo {
  id?: string;
  name: string;
  description: string;
  address: string;
  address_detail?: string;
  phone: string;
  business_number: string;
  hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  images: string[];
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface StoreHours {
  weekday: string;
  saturday: string;
  sunday: string;
}

// 현재 사용자의 매장 정보 조회
export async function getCurrentUserStore(): Promise<{ data: StoreInfo | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('사용자가 로그인되지 않았습니다.') };
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('seller_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116은 데이터가 없을 때의 에러
      return { data: null, error };
    }

    if (data) {
      // hours를 JSON으로 파싱 (PostgreSQL JSONB에서 가져올 때)
      const storeInfo: StoreInfo = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        address: data.address || '',
        address_detail: data.address_detail || '',
        phone: data.phone || '',
        business_number: data.business_number || '',
        hours: data.hours || {
          weekday: '09:00 - 18:00',
          saturday: '09:00 - 18:00',
          sunday: '휴무',
        },
        images: data.images || [],
        latitude: data.latitude,
        longitude: data.longitude,
        is_active: data.is_active,
        is_verified: data.is_verified,
      };
      return { data: storeInfo, error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('매장 정보 조회 오류:', error);
    return { data: null, error };
  }
}

// 매장 정보 생성
export async function createStore(storeData: Omit<StoreInfo, 'id'>): Promise<{ data: StoreInfo | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('사용자가 로그인되지 않았습니다.') };
    }

    // 먼저 매장 정보 저장 (이미지 없이)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        seller_id: user.id,
        name: storeData.name,
        description: storeData.description,
        address: storeData.address,
        address_detail: storeData.address_detail,
        phone: storeData.phone,
        business_number: storeData.business_number,
        hours: storeData.hours,
        images: [], // 일단 빈 배열로 저장
        latitude: storeData.latitude,
        longitude: storeData.longitude,
        is_active: storeData.is_active ?? true,
        is_verified: false,
      })
      .select()
      .single();

    if (storeError) {
      return { data: null, error: storeError };
    }

    // 이미지가 있으면 업로드
    let finalImages: string[] = [];
    if (storeData.images && storeData.images.length > 0) {
      const newLocalImages = getNewLocalImages(storeData.images);
      const existingServerImages = storeData.images.filter(img => !img.startsWith('blob:'));
      
      if (newLocalImages.length > 0) {
        // 로컬 이미지들을 File 객체로 변환하여 업로드
        const files: File[] = [];
        for (const imageUrl of newLocalImages) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });
            files.push(file);
          } catch (err) {
            console.error('이미지 변환 오류:', err);
          }
        }
        
        if (files.length > 0) {
          const { data: uploadedUrls, error: uploadError } = await uploadStoreImages(files, store.id);
          if (uploadError) {
            console.error('이미지 업로드 오류:', uploadError);
          } else {
            finalImages = [...existingServerImages, ...uploadedUrls];
          }
        }
      } else {
        finalImages = existingServerImages;
      }
      
      // 업로드된 이미지 URL로 매장 정보 업데이트
      if (finalImages.length !== storeData.images.length) {
        const { error: updateError } = await supabase
          .from('stores')
          .update({ images: finalImages })
          .eq('id', store.id);
          
        if (updateError) {
          console.error('이미지 URL 업데이트 오류:', updateError);
        }
      }
    }

    return { 
      data: { 
        ...store, 
        images: finalImages 
      } as StoreInfo, 
      error: null 
    };
  } catch (error) {
    console.error('매장 생성 오류:', error);
    return { data: null, error };
  }
}

// 매장 정보 수정
export async function updateStore(storeId: string, storeData: Partial<StoreInfo>): Promise<{ data: StoreInfo | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('사용자가 로그인되지 않았습니다.') };
    }

    // 기존 매장 정보 조회
    const { data: existingStore, error: fetchError } = await supabase
      .from('stores')
      .select('images')
      .eq('id', storeId)
      .eq('seller_id', user.id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    let finalImages: string[] = existingStore.images || [];

    // 이미지가 변경된 경우 처리
    if (storeData.images !== undefined) {
      const newLocalImages = getNewLocalImages(storeData.images);
      const existingServerImages = storeData.images.filter(img => !img.startsWith('blob:'));
      
      // 새로 추가된 로컬 이미지들 업로드
      if (newLocalImages.length > 0) {
        const files: File[] = [];
        for (const imageUrl of newLocalImages) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `image_${Date.now()}.jpg`, { type: blob.type });
            files.push(file);
          } catch (err) {
            console.error('이미지 변환 오류:', err);
          }
        }
        
        if (files.length > 0) {
          const { data: uploadedUrls, error: uploadError } = await uploadStoreImages(files, storeId);
          if (uploadError) {
            console.error('이미지 업로드 오류:', uploadError);
          } else {
            finalImages = [...existingServerImages, ...uploadedUrls];
          }
        }
      } else {
        finalImages = existingServerImages;
      }

      // 삭제된 이미지들 서버에서도 삭제
      const deletedImages = (existingStore.images || []).filter(img => !finalImages.includes(img));
      if (deletedImages.length > 0) {
        const { error: deleteError } = await deleteStoreImages(deletedImages);
        if (deleteError) {
          console.error('이미지 삭제 오류:', deleteError);
        }
      }
    }

    // 매장 정보 업데이트
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: storeData.name,
        description: storeData.description,
        address: storeData.address,
        address_detail: storeData.address_detail,
        phone: storeData.phone,
        business_number: storeData.business_number,
        hours: storeData.hours,
        images: finalImages,
        latitude: storeData.latitude,
        longitude: storeData.longitude,
        is_active: storeData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)
      .eq('seller_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as StoreInfo, error: null };
  } catch (error) {
    console.error('매장 수정 오류:', error);
    return { data: null, error };
  }
}

// 사용자의 판매자 신청 정보 조회 (기본값용)
export async function getSellerApplication(): Promise<{ data: any | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('사용자가 로그인되지 않았습니다.') };
    }

    const { data, error } = await supabase
      .from('seller_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('판매자 신청 정보 조회 오류:', error);
    return { data: null, error };
  }
}
