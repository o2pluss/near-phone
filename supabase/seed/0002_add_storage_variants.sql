-- Add storage variants to existing store_products
UPDATE store_products SET storage = '128gb' WHERE id = (SELECT id FROM store_products LIMIT 1);
UPDATE store_products SET storage = '512gb' WHERE id = (SELECT id FROM store_products OFFSET 1 LIMIT 1);

-- Add more store_products with different storage options
INSERT INTO store_products (store_id, product_id, price, storage, is_available) VALUES
  ((SELECT id FROM stores LIMIT 1), (SELECT id FROM products LIMIT 1), 1200000, '1tb', true),
  ((SELECT id FROM stores OFFSET 1 LIMIT 1), (SELECT id FROM products OFFSET 1 LIMIT 1), 800000, '128gb', true);
