-- device_models
create table if not exists public.device_models (
  id uuid primary key default gen_random_uuid(),
  manufacturer varchar(50) not null,
  model varchar(100) not null,
  supported_carriers text[] not null,
  supported_storage text[] not null,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_device_models_manu on public.device_models(manufacturer);
create index if not exists idx_device_models_model on public.device_models(model);
create index if not exists idx_device_models_carriers on public.device_models using gin(supported_carriers);
create index if not exists idx_device_models_storage on public.device_models using gin(supported_storage);
alter table public.device_models disable row level security;

-- seller_applications
create table if not exists public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_license text not null,
  business_address text default '',
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  business_description text default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_seller_apps_status on public.seller_applications(status);
create index if not exists idx_seller_apps_created on public.seller_applications(created_at);

alter table public.seller_applications enable row level security;
create policy p_seller_apps_read on public.seller_applications for select using (true);
create policy p_seller_apps_insert on public.seller_applications for insert with check (auth.uid() = user_id);
create policy p_seller_apps_update_owner on public.seller_applications for update using (auth.uid() = user_id);

-- product_tables
create table if not exists public.product_tables (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  exposure_start_date date not null,
  exposure_end_date date not null,
  is_active boolean default true,
  table_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_product_tables_name on public.product_tables(name);
create index if not exists idx_product_tables_is_active on public.product_tables(is_active);
create index if not exists idx_product_tables_created_at on public.product_tables(created_at);
create index if not exists idx_product_tables_updated_at on public.product_tables(updated_at);

alter table public.product_tables enable row level security;
create policy p_product_tables_read on public.product_tables for select using (true);
create policy p_product_tables_insert on public.product_tables for insert with check (auth.role() = 'authenticated');
create policy p_product_tables_update on public.product_tables for update using (auth.role() = 'authenticated');
create policy p_product_tables_delete on public.product_tables for delete using (auth.role() = 'authenticated');
