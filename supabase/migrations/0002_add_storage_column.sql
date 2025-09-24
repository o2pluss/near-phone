-- Add storage and carrier columns to store_products table
ALTER TABLE store_products 
ADD COLUMN storage VARCHAR(10) DEFAULT '256gb',
ADD COLUMN carrier TEXT DEFAULT 'kt';

-- Add indexes for better query performance
CREATE INDEX idx_store_products_storage ON store_products(storage);
CREATE INDEX idx_store_products_carrier ON store_products(carrier);

-- Update existing records with default values
UPDATE store_products SET storage = '256gb' WHERE storage IS NULL;
UPDATE store_products SET carrier = 'kt' WHERE carrier IS NULL;
