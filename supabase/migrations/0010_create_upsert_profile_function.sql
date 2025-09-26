-- 프로필 생성/업데이트를 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION upsert_profile(
  p_user_id UUID,
  p_role TEXT,
  p_name TEXT,
  p_phone TEXT,
  p_login_type TEXT,
  p_is_active BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, name, phone, login_type, is_active, created_at, updated_at)
  VALUES (p_user_id, p_role, p_name, p_phone, p_login_type, p_is_active, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    login_type = EXCLUDED.login_type,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RPC 함수에 대한 권한 설정
GRANT EXECUTE ON FUNCTION upsert_profile TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_profile TO anon;
