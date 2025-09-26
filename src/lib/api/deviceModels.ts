import { DeviceModel } from '../../types/product';

export type { DeviceModel };
import { ManufacturerCode, CarrierCode, StorageCode } from '../constants/codes';

// 실제 서버 API 호출
export const getDeviceModels = async (): Promise<DeviceModel[]> => {
  try {
    const response = await fetch('/api/device-models');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('단말기 모델 데이터 로드 실패:', error);
    throw error;
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
