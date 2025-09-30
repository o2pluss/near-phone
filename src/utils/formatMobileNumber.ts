/** 휴대폰 번호 형식 및 하이픈 자동 변환 */
export function formatMobileNumber(input: string): string {
  const value = input.replace(/[^0-9]/g, '');
  
  // 11자리 초과 입력 방지
  if (value.length > 11) {
    return value.slice(0, 11);
  }
  
  if (value.length === 11) {
    return value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'); // 010-0000-0000
  }
  if (value.length === 10) {
    return value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'); // 010-000-0000
  }
  return value; // 그 외는 하이픈 없이 그대로 반환
}

/** 휴대폰 번호에서 하이픈 제거 (서버 전송용) */
export function removeMobileNumberFormat(input: string): string {
  return input.replace(/[^0-9]/g, '');
}
