import { type DeviceModel } from '../types/product';

// 페이지네이션을 위한 응답 타입
export interface DeviceModelsResponse {
  data: DeviceModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 실제 서버 API 호출 (페이지네이션 지원)
export const getDeviceModels = async (page: number = 1, limit: number = 10): Promise<DeviceModelsResponse> => {
  try {
    const response = await fetch(`/api/device-models?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('단말기 모델 데이터 로드 실패:', error);
    // 오류 발생 시 빈 응답 반환 (컴포넌트에서 undefined 오류 방지)
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    };
  }
};

// 기존 함수 호환성을 위한 래퍼
export const getAllDeviceModels = async (): Promise<DeviceModel[]> => {
  try {
    const response = await getDeviceModels(1, 1000); // 큰 limit으로 모든 데이터 가져오기
    return response.data || [];
  } catch (error) {
    console.error('단말기 모델 데이터 로드 실패:', error);
    // 오류 발생 시 빈 배열 반환 (컴포넌트에서 undefined 오류 방지)
    return [];
  }
};

export const getDeviceModelById = async (id: string): Promise<DeviceModel | null> => {
  try {
    const response = await fetch(`/api/device-models/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('단말기 모델 조회 실패:', error);
    throw error;
  }
};

export const searchDeviceModels = async (query: string): Promise<DeviceModel[]> => {
  try {
    const response = await fetch(`/api/device-models/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('단말기 모델 검색 실패:', error);
    throw error;
  }
};

export const getDeviceModelsByManufacturer = async (manufacturer: ManufacturerCode): Promise<DeviceModel[]> => {
  try {
    const response = await fetch(`/api/device-models?manufacturer=${manufacturer}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('제조사별 단말기 모델 조회 실패:', error);
    throw error;
  }
};

export const getDeviceModelsByCarrier = async (carrier: CarrierCode): Promise<DeviceModel[]> => {
  try {
    const response = await fetch(`/api/device-models?carrier=${carrier}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('통신사별 단말기 모델 조회 실패:', error);
    throw error;
  }
};

export const getDeviceModelsByStorage = async (storage: StorageCode): Promise<DeviceModel[]> => {
  try {
    const response = await fetch(`/api/device-models?storage=${storage}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('용량별 단말기 모델 조회 실패:', error);
    throw error;
  }
};
