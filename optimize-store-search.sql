-- store-search 최적화를 위한 SQL 스크립트

-- 1. 필요한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_table_id_active 
ON products(table_id, is_active);

CREATE INDEX IF NOT EXISTS idx_products_store_table_active 
ON products(store_id, table_id, is_active);

CREATE INDEX IF NOT EXISTS idx_products_conditions_gin 
ON products USING gin(conditions);

CREATE INDEX IF NOT EXISTS idx_product_tables_store_active_dates 
ON product_tables(store_id, is_active, exposure_start_date, exposure_end_date);

CREATE INDEX IF NOT EXISTS idx_product_tables_store_created 
ON product_tables(store_id, created_at DESC);

-- 2. SQL 실행을 위한 함수 생성 (개발용)
CREATE OR REPLACE FUNCTION execute_sql(sql text, params jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- 실제 프로덕션에서는 보안상 이 함수를 사용하지 말고
    -- Supabase의 RPC 함수를 사용하세요
    EXECUTE sql INTO result USING params;
    RETURN result;
END;
$$;

-- 3. 최적화된 상품 검색 함수
CREATE OR REPLACE FUNCTION search_products_optimized(
    p_store_id uuid DEFAULT NULL,
    p_carrier text DEFAULT NULL,
    p_min_price integer DEFAULT NULL,
    p_max_price integer DEFAULT NULL,
    p_storage text DEFAULT NULL,
    p_signup_type text DEFAULT NULL,
    p_conditions text[] DEFAULT NULL,
    p_search_query text DEFAULT NULL,
    p_cursor timestamp with time zone DEFAULT NULL,
    p_limit integer DEFAULT 15
)
RETURNS TABLE (
    id uuid,
    store_id uuid,
    device_model_id uuid,
    carrier text,
    storage text,
    price integer,
    conditions text[],
    is_active boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    device_model jsonb,
    product_table jsonb,
    store jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
    today_date date := CURRENT_DATE;
BEGIN
    RETURN QUERY
    WITH active_tables AS (
        SELECT 
            pt.id,
            pt.store_id,
            pt.created_at,
            ROW_NUMBER() OVER (PARTITION BY pt.store_id ORDER BY pt.created_at DESC) as rn
        FROM product_tables pt
        WHERE pt.is_active = true
          AND pt.exposure_start_date <= today_date
          AND pt.exposure_end_date >= today_date
    ),
    latest_tables AS (
        SELECT id, store_id
        FROM active_tables
        WHERE rn = 1
    )
    SELECT 
        p.id,
        p.store_id,
        p.device_model_id,
        p.carrier,
        p.storage,
        p.price,
        p.conditions,
        p.is_active,
        p.created_at,
        p.updated_at,
        jsonb_build_object(
            'id', dm.id,
            'manufacturer', dm.manufacturer,
            'device_name', dm.device_name,
            'model_name', dm.model_name,
            'image_url', dm.image_url
        ) as device_model,
        jsonb_build_object(
            'id', pt.id,
            'name', pt.name,
            'exposure_start_date', pt.exposure_start_date,
            'exposure_end_date', pt.exposure_end_date
        ) as product_table,
        jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'address', s.address,
            'phone', s.phone,
            'rating', s.rating,
            'review_count', s.review_count,
            'hours', COALESCE(s.hours, '09:00 - 21:00')
        ) as store
    FROM products p
    INNER JOIN latest_tables lt ON p.table_id = lt.id AND p.store_id = lt.store_id
    INNER JOIN device_models dm ON p.device_model_id = dm.id
    INNER JOIN product_tables pt ON p.table_id = pt.id
    INNER JOIN stores s ON p.store_id = s.id
    WHERE p.is_active = true
      AND (p_store_id IS NULL OR p.store_id = p_store_id)
      AND (p_carrier IS NULL OR p.carrier = p_carrier)
      AND (p_min_price IS NULL OR p.price >= p_min_price)
      AND (p_max_price IS NULL OR p.price <= p_max_price)
      AND (p_storage IS NULL OR p.storage = p_storage)
      AND (p_signup_type IS NULL OR p.conditions @> ARRAY[p_signup_type])
      AND (p_conditions IS NULL OR p.conditions @> p_conditions)
      AND (p_search_query IS NULL OR (dm.device_name ILIKE '%' || p_search_query || '%' OR dm.model_name ILIKE '%' || p_search_query || '%'))
      AND (p_cursor IS NULL OR p.created_at < p_cursor)
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$;

-- 4. 함수 권한 설정
GRANT EXECUTE ON FUNCTION search_products_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION search_products_optimized TO anon;

-- 5. 사용 예시
-- SELECT * FROM search_products_optimized(
--     p_carrier := 'KT',
--     p_storage := '256GB',
--     p_min_price := 100000,
--     p_max_price := 500000,
--     p_limit := 10
-- );
