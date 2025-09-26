// 추가 조건 상수 정의
export const ADDITIONAL_CONDITIONS = {
  'card_discount': '카드할인',
  'bundle_discount': '결합할인', 
  'required_plan': '필수요금제',
  'addon_service': '부가서비스'
} as const;

export type AdditionalConditionKey = keyof typeof ADDITIONAL_CONDITIONS;

// 조건 표시용 간단한 이름 매핑
export const CONDITION_DISPLAY_NAMES: Record<AdditionalConditionKey, string> = {
  'card_discount': '카드',
  'bundle_discount': '결합',
  'required_plan': '요금',
  'addon_service': '부가'
};

// KEY를 텍스트로 변환하는 함수
export function getConditionText(key: AdditionalConditionKey): string {
  return ADDITIONAL_CONDITIONS[key];
}

// 텍스트를 KEY로 변환하는 함수
export function getConditionKey(text: string): AdditionalConditionKey | null {
  const entry = Object.entries(ADDITIONAL_CONDITIONS).find(([_, value]) => value === text);
  return entry ? (entry[0] as AdditionalConditionKey) : null;
}

// KEY 배열을 텍스트 배열로 변환
export function convertKeysToTexts(keys: AdditionalConditionKey[]): string[] {
  return keys.map(key => ADDITIONAL_CONDITIONS[key]);
}

// 텍스트 배열을 KEY 배열로 변환
export function convertTextsToKeys(texts: string[]): AdditionalConditionKey[] {
  return texts.map(text => getConditionKey(text)).filter(Boolean) as AdditionalConditionKey[];
}
