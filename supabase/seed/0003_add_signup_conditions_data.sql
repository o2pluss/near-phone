-- Add variety of signup types and conditions to existing store_products
UPDATE store_products SET 
  signup_type = '번호이동',
  conditions = ARRAY['카드 할인', '결합 할인']::TEXT[]
WHERE id = (SELECT id FROM store_products LIMIT 1);

UPDATE store_products SET 
  signup_type = '기기변경',
  conditions = ARRAY['필수 요금제', '부가서비스']::TEXT[]
WHERE id = (SELECT id FROM store_products OFFSET 1 LIMIT 1);

-- Add more store_products with different combinations
INSERT INTO store_products (store_id, product_id, price, storage, signup_type, conditions, is_available) VALUES
  ((SELECT id FROM stores LIMIT 1), (SELECT id FROM products LIMIT 1), 1000000, '256gb', '신규가입', ARRAY['필수 요금제', '카드 할인']::TEXT[], true),
  ((SELECT id FROM stores OFFSET 1 LIMIT 1), (SELECT id FROM products OFFSET 1 LIMIT 1), 900000, '512gb', '번호이동', ARRAY['결합 할인', '부가서비스']::TEXT[], true);
