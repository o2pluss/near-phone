// 통신사 코드 관리
export const CARRIER_CODES = {
  KT: 'KT',
  SKT: 'SKT', 
  LG_U_PLUS: 'LG_U_PLUS'
} as const;

export const CARRIER_LABELS = {
  [CARRIER_CODES.KT]: 'KT',
  [CARRIER_CODES.SKT]: 'SKT',
  [CARRIER_CODES.LG_U_PLUS]: 'LG U+'
} as const;

export type CarrierCode = typeof CARRIER_CODES[keyof typeof CARRIER_CODES];

// 제조사 코드 관리
export const MANUFACTURER_CODES = {
  SAMSUNG: 'SAMSUNG',
  APPLE: 'APPLE'
} as const;

export const MANUFACTURER_LABELS = {
  [MANUFACTURER_CODES.SAMSUNG]: '삼성',
  [MANUFACTURER_CODES.APPLE]: '애플'
} as const;

export type ManufacturerCode = typeof MANUFACTURER_CODES[keyof typeof MANUFACTURER_CODES];

// 용량 코드 관리
export const STORAGE_CODES = {
  GB_128: '128GB',
  GB_256: '256GB',
  GB_512: '512GB',
  TB_1: '1TB'
} as const;

export const STORAGE_LABELS = {
  [STORAGE_CODES.GB_128]: '128GB',
  [STORAGE_CODES.GB_256]: '256GB',
  [STORAGE_CODES.GB_512]: '512GB',
  [STORAGE_CODES.TB_1]: '1TB'
} as const;

export type StorageCode = typeof STORAGE_CODES[keyof typeof STORAGE_CODES];

// 코드 변환 유틸리티 함수들
export const getCarrierLabel = (code: CarrierCode): string => {
  return CARRIER_LABELS[code] || code;
};

export const getManufacturerLabel = (code: ManufacturerCode): string => {
  return MANUFACTURER_LABELS[code] || code;
};

export const getStorageLabel = (code: StorageCode): string => {
  return STORAGE_LABELS[code] || code;
};

// 코드 배열 반환 함수들
export const getAllCarrierCodes = (): CarrierCode[] => {
  return Object.values(CARRIER_CODES);
};

export const getAllManufacturerCodes = (): ManufacturerCode[] => {
  return Object.values(MANUFACTURER_CODES);
};

export const getAllStorageCodes = (): StorageCode[] => {
  return Object.values(STORAGE_CODES);
};

// 코드 검증 함수들
export const isValidCarrierCode = (code: string): code is CarrierCode => {
  return Object.values(CARRIER_CODES).includes(code as CarrierCode);
};

export const isValidManufacturerCode = (code: string): code is ManufacturerCode => {
  return Object.values(MANUFACTURER_CODES).includes(code as ManufacturerCode);
};

export const isValidStorageCode = (code: string): code is StorageCode => {
  return Object.values(STORAGE_CODES).includes(code as StorageCode);
};
