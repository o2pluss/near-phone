-- upsert_profile RPC 함수 생성
CREATE OR REPLACE FUNCTION upsert_profile(
  p_user_id uuid,
  p_role text,
  p_name text,
  p_phone text,
  p_login_type text,
  p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 프로필이 존재하는지 확인
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    -- 프로필이 존재하면 업데이트
    UPDATE public.profiles 
    SET 
      role = p_role,
      name = p_name,
      phone = p_phone,
      login_type = p_login_type,
      is_active = p_is_active,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- 프로필이 존재하지 않으면 새로 생성
    INSERT INTO public.profiles (
      user_id,
      role,
      name,
      phone,
      login_type,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_role,
      p_name,
      p_phone,
      p_login_type,
      p_is_active,
      now(),
      now()
    );
  END IF;
END;
$$;

-- RPC 함수에 대한 권한 설정
GRANT EXECUTE ON FUNCTION upsert_profile(uuid, text, text, text, text, boolean) TO authenticated;
