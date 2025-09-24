-- 판매자 신청 테이블
create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_license text not null,
  business_address text not null,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  business_description text,
  status text check (status in ('pending', 'approved', 'rejected')) not null default 'pending',
  rejection_reason text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 인덱스 생성
create index if not exists idx_seller_applications_user on public.seller_applications(user_id);
create index if not exists idx_seller_applications_status on public.seller_applications(status);
create index if not exists idx_seller_applications_created on public.seller_applications(created_at);

-- RLS 정책
alter table public.seller_applications enable row level security;

-- 사용자는 자신의 신청서만 조회/수정 가능
create policy p_seller_applications_select_self on public.seller_applications 
  for select using (auth.uid() = user_id);

create policy p_seller_applications_insert_self on public.seller_applications 
  for insert with check (auth.uid() = user_id);

create policy p_seller_applications_update_self on public.seller_applications 
  for update using (auth.uid() = user_id);

-- 관리자는 모든 신청서 조회/수정 가능
create policy p_seller_applications_admin_all on public.seller_applications 
  for all using (
    exists (
      select 1 from public.profiles 
      where user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- profiles 테이블에 seller_application_id 추가
alter table public.profiles 
add column if not exists seller_application_id uuid references public.seller_applications(id);

-- 판매자 프로필 생성 함수
create or replace function create_seller_profile()
returns trigger as $$
begin
  -- 승인된 신청서에 대해 판매자 프로필 생성
  if new.status = 'approved' and old.status != 'approved' then
    insert into public.profiles (
      user_id,
      role,
      name,
      phone,
      login_type,
      is_active,
      seller_application_id
    ) values (
      new.user_id,
      'seller',
      new.contact_name,
      new.contact_phone,
      'email',
      true,
      new.id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- 트리거 생성
create trigger t_seller_application_approved
  after update on public.seller_applications
  for each row
  execute function create_seller_profile();
