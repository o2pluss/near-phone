import { supabase } from './supabaseClient';

// 이미지 업로드
export async function uploadStoreImage(file: File, storeId: string): Promise<{ data: string | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('사용자가 로그인되지 않았습니다.') };
    }

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${storeId}/${timestamp}_${randomString}.${fileExt}`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('store-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('이미지 업로드 오류:', error);
      return { data: null, error };
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('store-images')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return { data: null, error };
  }
}

// 여러 이미지 업로드
export async function uploadStoreImages(files: File[], storeId: string): Promise<{ data: string[]; error: any }> {
  try {
    const uploadPromises = files.map(file => uploadStoreImage(file, storeId));
    const results = await Promise.all(uploadPromises);
    
    const uploadedUrls: string[] = [];
    const errors: any[] = [];

    results.forEach((result, index) => {
      if (result.error) {
        errors.push({ index, error: result.error });
      } else if (result.data) {
        uploadedUrls.push(result.data);
      }
    });

    if (errors.length > 0) {
      console.error('일부 이미지 업로드 실패:', errors);
      return { data: uploadedUrls, error: errors };
    }

    return { data: uploadedUrls, error: null };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return { data: [], error };
  }
}

// 이미지 삭제
export async function deleteStoreImage(imageUrl: string): Promise<{ data: boolean; error: any }> {
  try {
    // URL에서 파일 경로 추출
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from('store-images')
      .remove([fileName]);

    if (error) {
      console.error('이미지 삭제 오류:', error);
      return { data: false, error };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return { data: false, error };
  }
}

// 여러 이미지 삭제
export async function deleteStoreImages(imageUrls: string[]): Promise<{ data: boolean; error: any }> {
  try {
    const deletePromises = imageUrls.map(url => deleteStoreImage(url));
    const results = await Promise.all(deletePromises);
    
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      console.error('일부 이미지 삭제 실패:', errors);
      return { data: false, error: errors };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return { data: false, error };
  }
}

// 로컬 이미지 URL을 서버 URL로 변환 (임시용)
export function convertLocalToServerImages(localImages: string[], serverImages: string[]): string[] {
  // 로컬 이미지와 서버 이미지를 합치되, 중복 제거
  const allImages = [...serverImages];
  
  // 로컬 이미지 중에서 blob: URL이 아닌 것들만 추가 (이미 서버에 업로드된 것들)
  localImages.forEach(image => {
    if (!image.startsWith('blob:') && !allImages.includes(image)) {
      allImages.push(image);
    }
  });
  
  return allImages;
}

// 새로 추가된 로컬 이미지들만 필터링
export function getNewLocalImages(localImages: string[]): string[] {
  return localImages.filter(image => image.startsWith('blob:'));
}
