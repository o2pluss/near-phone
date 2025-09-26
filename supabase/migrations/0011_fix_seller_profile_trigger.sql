-- 판매자 프로필 생성/업데이트 함수 수정 (중복 방지)
create or replace function create_seller_profile()
returns trigger as $$
begin
  -- 승인된 신청서에 대해 판매자 프로필 생성/업데이트
  if new.status = 'approved' and old.status != 'approved' then
    -- 프로필이 이미 존재하는지 확인하고 upsert 수행
    insert into public.profiles (
      user_id,
      role,
      name,
      phone,
      login_type,
      is_active,
      seller_application_id,
      created_at,
      updated_at
    ) values (
      new.user_id,
      'seller',
      new.contact_name,
      new.contact_phone,
      'email',
      true,
      new.id,
      now(),
      now()
    )
    on conflict (user_id) 
    do update set
      role = 'seller',
      name = new.contact_name,
      phone = new.contact_phone,
      is_active = true,
      seller_application_id = new.id,
      updated_at = now();
  end if;
  
  return new;
end;
$$ language plpgsql security definer;
