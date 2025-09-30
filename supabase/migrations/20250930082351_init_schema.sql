-- Initial production schema
create extension if not exists postgis;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('user','seller','admin')) not null default 'user',
  name text,
  phone text,
  login_type text check (login_type in ('kakao','email')) default 'email',
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  address text,
  address_detail text,
  latitude double precision,
  longitude double precision,
  phone text,
  business_number text,
  is_active boolean not null default true,
  is_verified boolean not null default false,
  rating double precision default 0,
  review_count int default 0,
  view_count int default 0,
  facilities jsonb,
  special_services jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists idx_stores_location on public.stores using gist (st_makepoint(longitude, latitude));

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  model text,
  color text,
  storage text,
  image_url text,
  specifications jsonb,
  official_price int,
  is_active boolean not null default true,
  is_deleted boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  price int not null,
  discount_price int,
  stock int,
  conditions text,
  promotion_options jsonb,
  is_available boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (store_id, product_id)
);
create index if not exists idx_store_products_store on public.store_products(store_id);
create index if not exists idx_store_products_price on public.store_products(price);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  store_product_id uuid references public.store_products(id) on delete set null,
  status text check (status in ('pending','confirmed','completed','cancelled','no_show')) not null default 'pending',
  reservation_date date not null,
  reservation_time time not null,
  customer_name text,
  customer_phone text,
  memo text,
  cancellation_reason text,
  confirmed_at timestamp with time zone,
  completed_at timestamp with time zone,
  product_snapshot jsonb,
  store_snapshot jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists idx_reservations_user on public.reservations(user_id);
create index if not exists idx_reservations_store on public.reservations(store_id);
create index if not exists idx_reservations_date on public.reservations(reservation_date);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  rating int check (rating between 1 and 5) not null,
  content text,
  status text check (status in ('active','hidden','deleted','reported')) not null default 'active',
  helpful_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists idx_reviews_store on public.reviews(store_id);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, store_id)
);

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.store_products enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

create policy p_stores_read on public.stores for select using (true);
create policy p_products_read on public.products for select using (true);
create policy p_store_products_read on public.store_products for select using (true);
create policy p_reviews_read on public.reviews for select using (true);

create policy p_profiles_select_self on public.profiles for select using (auth.uid() = user_id);
create policy p_profiles_update_self on public.profiles for update using (auth.uid() = user_id);
create policy p_profiles_insert_self on public.profiles for insert with check (auth.uid() = user_id);

create policy p_stores_manage_seller on public.stores for all using (
  auth.jwt() ->> 'role' = 'admin' or seller_id = auth.uid()
) with check (
  auth.jwt() ->> 'role' = 'admin' or seller_id = auth.uid()
);

create policy p_store_products_manage_seller on public.store_products for all using (
  auth.jwt() ->> 'role' = 'admin' or exists (
    select 1 from public.stores s where s.id = store_products.store_id and s.seller_id = auth.uid()
  )
) with check (
  auth.jwt() ->> 'role' = 'admin' or exists (
    select 1 from public.stores s where s.id = store_products.store_id and s.seller_id = auth.uid()
  )
);

create policy p_reservations_user_crud on public.reservations for all using (
  auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin'
) with check (auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin');
create policy p_reservations_seller_read on public.reservations for select using (
  exists (select 1 from public.stores s where s.id = reservations.store_id and s.seller_id = auth.uid())
);

create policy p_reviews_user_crud on public.reviews for all using (
  auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin'
) with check (auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin');
create policy p_reviews_seller_read on public.reviews for select using (
  exists (select 1 from public.stores s where s.id = reviews.store_id and s.seller_id = auth.uid())
);

create policy p_favorites_user_crud on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


