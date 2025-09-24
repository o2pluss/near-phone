-- Add signup_type column to store_products table (conditions already exists)
ALTER TABLE store_products 
ADD COLUMN signup_type VARCHAR(20) DEFAULT '신규가입';

-- Add index for better query performance
CREATE INDEX idx_store_products_signup_type ON store_products(signup_type);

-- Update existing records with default values
UPDATE store_products SET 
  signup_type = '신규가입'
WHERE signup_type IS NULL;
