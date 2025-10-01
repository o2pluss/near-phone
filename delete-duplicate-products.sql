-- 중복 상품 데이터 삭제
DELETE FROM products 
WHERE store_id = '29ef94d2-6b27-4a74-852a-a8ce094638f1' 
  AND device_model_id = 'd64ebe0d-ab0a-4adf-9ad2-ffc4e7709f53' 
  AND carrier = 'KT' 
  AND storage = '128GB' 
  AND conditions = '{"번호이동"}';

-- 삭제 결과 확인
SELECT COUNT(*) as remaining_products FROM products 
WHERE store_id = '29ef94d2-6b27-4a74-852a-a8ce094638f1';
