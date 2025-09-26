import { supabase } from './supabaseClient';

export interface SellerApplicationData {
  name: string;
  email: string;
  password: string;
  storeName: string;
  phone: string;
  businessNumber: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_license: string;
  business_address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  business_description?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// 판매자 신청 생성
export async function createSellerApplication(data: SellerApplicationData) {
  try {
    // 1. 먼저 사용자 계정 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('사용자 생성에 실패했습니다.');
    }

    // 2. 판매자 신청 데이터 저장
    const { data: applicationData, error: applicationError } = await supabase
      .from('seller_applications')
      .insert({
        user_id: authData.user.id,
        business_name: data.storeName,
        business_license: data.businessNumber,
        business_address: '', // 주소는 나중에 추가
        contact_name: data.name,
        contact_phone: data.phone,
        contact_email: data.email,
        business_description: '',
        status: 'pending',
      })
      .select()
      .single();

    if (applicationError) {
      throw applicationError;
    }

    return { data: applicationData, error: null };
  } catch (error) {
    console.error('판매자 신청 생성 오류:', error);
    return { data: null, error };
  }
}

// 모든 판매자 신청 조회 (관리자용)
export async function getAllSellerApplications() {
  try {
    const { data, error } = await supabase
      .from('seller_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('판매자 신청 조회 오류:', error);
    return { data: null, error };
  }
}

// 판매자 신청 승인/거부
export async function updateSellerApplicationStatus(
  applicationId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
) {
  try {
    // 1. 먼저 신청서 정보 조회
    const { data: application, error: fetchError } = await supabase
      .from('seller_applications')
      .select('user_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // 2. 신청서 상태 업데이트
    const { data, error } = await supabase
      .from('seller_applications')
      .update({
        status,
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 3. 승인된 경우 profiles 테이블의 is_active를 true로 업데이트
    if (status === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', application.user_id);

      if (profileError) {
        console.error('프로필 활성화 오류:', profileError);
        // 프로필 업데이트 실패해도 신청서 상태는 업데이트되었으므로 계속 진행
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('판매자 신청 상태 업데이트 오류:', error);
    return { data: null, error };
  }
}

// 사용자의 판매자 신청 상태 조회
export async function getSellerApplicationStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('seller_applications')
      .select('status, rejection_reason, created_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 신청서가 없는 경우
        return { data: null, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('판매자 신청 상태 조회 오류:', error);
    return { data: null, error };
  }
}
