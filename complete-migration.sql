-- 완전한 실서버 마이그레이션 SQL
-- 이 파일을 Supabase SQL Editor에서 실행하세요

BEGIN;

-- 1. 기존 테이블들 정리 (데이터가 거의 없으므로 안전하게 삭제)
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.store_products CASCADE;
DROP TABLE IF EXISTS public.device_models CASCADE;
DROP TABLE IF EXISTS public.product_tables CASCADE;
DROP TABLE IF EXISTS public.seller_applications CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;

-- 2. seller_applications 테이블 생성 (판매자 신청)
CREATE TABLE public.seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_license VARCHAR(50) NOT NULL,
  business_address TEXT DEFAULT '',
  contact_name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  business_description TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. device_models 테이블 생성 (단말기 모델)
CREATE TABLE public.device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer VARCHAR(20) NOT NULL,
  model VARCHAR(100) NOT NULL,
  device_name VARCHAR(100),
  model_name VARCHAR(100),
  supported_carriers TEXT[] NOT NULL,
  supported_storage TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제조사 코드 검증
  CONSTRAINT valid_manufacturer CHECK (
    manufacturer IN ('SAMSUNG', 'APPLE', 'LG')
  ),
  
  -- 통신사 코드 검증
  CONSTRAINT valid_carrier_codes CHECK (
    supported_carriers <@ ARRAY['KT', 'SKT', 'LG_U_PLUS']::TEXT[]
  ),
  
  -- 용량 코드 검증
  CONSTRAINT valid_storage_codes CHECK (
    supported_storage <@ ARRAY['128GB', '256GB', '512GB', '1TB', '2TB']::TEXT[]
  )
);

-- 4. product_tables 테이블 생성 (상품 테이블/노출 기간 관리)
CREATE TABLE public.product_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  exposure_start_date DATE NOT NULL,
  exposure_end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  table_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. products 테이블 생성 (실제 판매 상품)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  device_model_id UUID NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
  carrier VARCHAR(20) NOT NULL,
  storage VARCHAR(10) NOT NULL,
  price INTEGER NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  table_id UUID REFERENCES public.product_tables(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 유니크 제약조건
  UNIQUE(store_id, device_model_id, carrier, storage, conditions),
  
  -- 코드 검증
  CONSTRAINT valid_carrier CHECK (
    carrier IN ('KT', 'SKT', 'LG_U_PLUS')
  ),
  CONSTRAINT valid_storage CHECK (
    storage IN ('128GB', '256GB', '512GB', '1TB', '2TB')
  )
);

-- 6. store_products 테이블 생성 (매장별 상품 정보)
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  discount_price INTEGER,
  stock INTEGER,
  conditions TEXT,
  promotion_options JSONB,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- 7. favorites 테이블 생성 (즐겨찾기)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 인덱스 생성
-- seller_applications
CREATE INDEX idx_seller_applications_user_id ON public.seller_applications(user_id);
CREATE INDEX idx_seller_applications_status ON public.seller_applications(status);
CREATE INDEX idx_seller_applications_created_at ON public.seller_applications(created_at);

-- device_models
CREATE INDEX idx_device_models_manufacturer ON public.device_models(manufacturer);
CREATE INDEX idx_device_models_model ON public.device_models(model);
CREATE INDEX idx_device_models_device_name ON public.device_models(device_name);
CREATE INDEX idx_device_models_model_name ON public.device_models(model_name);
CREATE INDEX idx_device_models_carriers ON public.device_models USING GIN(supported_carriers);
CREATE INDEX idx_device_models_storage ON public.device_models USING GIN(supported_storage);
CREATE INDEX idx_device_models_created_at ON public.device_models(created_at);

-- product_tables
CREATE INDEX idx_product_tables_name ON public.product_tables(name);
CREATE INDEX idx_product_tables_is_active ON public.product_tables(is_active);
CREATE INDEX idx_product_tables_exposure_dates ON public.product_tables(exposure_start_date, exposure_end_date);
CREATE INDEX idx_product_tables_created_at ON public.product_tables(created_at);

-- products
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_products_device_model_id ON public.products(device_model_id);
CREATE INDEX idx_products_carrier ON public.products(carrier);
CREATE INDEX idx_products_storage ON public.products(storage);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_table_id ON public.products(table_id);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- store_products
CREATE INDEX idx_store_products_store_id ON public.store_products(store_id);
CREATE INDEX idx_store_products_product_id ON public.store_products(product_id);
CREATE INDEX idx_store_products_price ON public.store_products(price);
CREATE INDEX idx_store_products_is_available ON public.store_products(is_available);

-- favorites
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_store_id ON public.favorites(store_id);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at);

-- 9. updated_at 자동 업데이트 함수 및 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_seller_applications_updated_at 
    BEFORE UPDATE ON public.seller_applications 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_models_updated_at 
    BEFORE UPDATE ON public.device_models 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_tables_updated_at 
    BEFORE UPDATE ON public.product_tables 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_products_updated_at 
    BEFORE UPDATE ON public.store_products 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. RLS (Row Level Security) 정책 설정
-- seller_applications
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_applications_select_policy" ON public.seller_applications
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "seller_applications_insert_policy" ON public.seller_applications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "seller_applications_update_policy" ON public.seller_applications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- device_models
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "device_models_select_policy" ON public.device_models
    FOR SELECT USING (true);
CREATE POLICY "device_models_insert_policy" ON public.device_models
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "device_models_update_policy" ON public.device_models
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "device_models_delete_policy" ON public.device_models
    FOR DELETE USING (auth.role() = 'authenticated');

-- product_tables
ALTER TABLE public.product_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_tables_select_policy" ON public.product_tables
    FOR SELECT USING (true);
CREATE POLICY "product_tables_insert_policy" ON public.product_tables
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "product_tables_update_policy" ON public.product_tables
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "product_tables_delete_policy" ON public.product_tables
    FOR DELETE USING (auth.role() = 'authenticated');

-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (true);
CREATE POLICY "products_insert_policy" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "products_update_policy" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "products_delete_policy" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- store_products
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store_products_select_policy" ON public.store_products
    FOR SELECT USING (true);
CREATE POLICY "store_products_insert_policy" ON public.store_products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "store_products_update_policy" ON public.store_products
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "store_products_delete_policy" ON public.store_products
    FOR DELETE USING (auth.role() = 'authenticated');

-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_policy" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_policy" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_policy" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 11. 샘플 데이터 삽입 (선택사항)
-- device_models 샘플 데이터
INSERT INTO public.device_models (manufacturer, model, device_name, model_name, supported_carriers, supported_storage, image_url) VALUES
('SAMSUNG', 'Galaxy S24 Ultra', 'Galaxy S24 Ultra', 'SM-S928', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('SAMSUNG', 'Galaxy S24+', 'Galaxy S24+', 'SM-S926', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('SAMSUNG', 'Galaxy S24', 'Galaxy S24', 'SM-S921', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null),
('APPLE', 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', 'A3108', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15 Pro', 'iPhone 15 Pro', 'A3104', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB', '1TB'], null),
('APPLE', 'iPhone 15', 'iPhone 15', 'A3100', ARRAY['KT', 'SKT', 'LG_U_PLUS'], ARRAY['128GB', '256GB', '512GB'], null)
ON CONFLICT DO NOTHING;

-- product_tables 샘플 데이터
INSERT INTO public.product_tables (name, exposure_start_date, exposure_end_date, is_active) VALUES
('2024년 9월 상품 테이블', '2024-09-01', '2024-09-30', true),
('2024년 10월 상품 테이블', '2024-10-01', '2024-10-31', true),
('2024년 11월 상품 테이블', '2024-11-01', '2024-11-30', true)
ON CONFLICT DO NOTHING;

COMMIT;
