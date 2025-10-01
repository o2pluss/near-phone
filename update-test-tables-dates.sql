-- 테스트용 상품 테이블들의 노출기간을 현재 날짜에 맞게 수정

-- 현재 날짜 기준으로 노출기간 설정
UPDATE product_tables 
SET 
  exposure_start_date = '2025-09-30',  -- 오늘
  exposure_end_date = '2025-10-15',    -- 2주 후
  updated_at = NOW()
WHERE name IN ('테스트', 'h4', 'ㅇㄴㄹ', 'aㅇㄹ2', 'ㅁㅍㅅ4', 'ㄴㅇㄹ', '2343', 'ㅇ2', 'ㅍㄱㅁ');

-- 수정 결과 확인
SELECT 
  name,
  exposure_start_date,
  exposure_end_date,
  CASE 
    WHEN CURRENT_DATE >= exposure_start_date AND CURRENT_DATE <= exposure_end_date 
    THEN '활성'
    WHEN CURRENT_DATE < exposure_start_date 
    THEN '예정'
    WHEN CURRENT_DATE > exposure_end_date 
    THEN '만료'
  END as status
FROM product_tables 
WHERE name IN ('테스트', 'h4', 'ㅇㄴㄹ', 'aㅇㄹ2', 'ㅁㅍㅅ4', 'ㄴㅇㄹ', '2343', 'ㅇ2', 'ㅍㄱㅁ')
ORDER BY created_at DESC;
