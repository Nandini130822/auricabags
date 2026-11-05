-- =====================================================================
--  AURICA BAGS — Supabase schema
--  Run this whole file once in Supabase → SQL Editor → New query → Run.
--  Then run seed.sql for demo categories / products / coupons.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  PROFILES  (one row per auth user, created automatically)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------
--  CATALOGUE
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid references public.categories(id) on delete set null,
  price            numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  stock            int not null default 0,
  sku              text,
  images           text[] not null default '{}',
  colors           text[] not null default '{}',
  occasions        text[] not null default '{}',
  material         text,
  dimensions       text,
  is_featured      boolean not null default false,
  is_new           boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

-- ---------------------------------------------------------------------
--  CUSTOMER DATA
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  pincode     text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.wishlist (
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
--  OFFERS
-- ---------------------------------------------------------------------
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  description   text,
  type          text not null default 'percent' check (type in ('percent','flat')),
  value         numeric(10,2) not null,
  min_order     numeric(10,2) not null default 0,
  max_discount  numeric(10,2),
  usage_limit   int,
  used_count    int not null default 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  ORDERS, PAYMENTS, SHIPMENTS
-- ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique default ('AUR' || nextval('public.order_number_seq')),
  user_id          uuid references auth.users(id) on delete set null,
  email            text not null,
  customer_name    text not null,
  phone            text not null,
  shipping_address jsonb not null,
  subtotal         numeric(10,2) not null,
  discount         numeric(10,2) not null default 0,
  shipping_fee     numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text,
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled','returned')),
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending','paid','failed','refunded')),
  payment_method   text not null default 'upi'
                   check (payment_method in ('card','upi','netbanking','cod')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  name        text not null,
  image       text,
  color       text,
  price       numeric(10,2) not null,
  quantity    int not null check (quantity > 0)
);

create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  provider            text not null default 'razorpay_demo',
  provider_payment_id text,
  method              text not null,
  amount              numeric(10,2) not null,
  status              text not null default 'created'
                      check (status in ('created','captured','failed','refunded')),
  created_at          timestamptz not null default now()
);

create table if not exists public.shipments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references public.orders(id) on delete cascade,
  courier     text not null,
  awb         text not null,
  status      text not null default 'created'
              check (status in ('created','picked_up','in_transit','out_for_delivery','delivered','rto')),
  events      jsonb not null default '[]',
  eta         date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  REVIEWS
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  author_name  text not null,
  rating       int not null check (rating between 1 and 5),
  title        text,
  body         text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  STORE SETTINGS (demo payment / delivery configuration)
-- ---------------------------------------------------------------------
create table if not exists public.store_settings (
  id          int primary key default 1 check (id = 1),
  payment     jsonb not null default '{"provider":"razorpay","mode":"test","key_id":"rzp_test_demo1234","cod_enabled":true,"upi_enabled":true,"card_enabled":true,"netbanking_enabled":true}',
  delivery    jsonb not null default '{"provider":"shiprocket","mode":"test","pickup_pincode":"395009","free_shipping_above":1999,"flat_fee":99,"couriers":["Delhivery","Blue Dart","Xpressbees","DTDC"]}',
  updated_at  timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
--  COUPON VALIDATION (public RPC — never exposes the coupon table)
-- ---------------------------------------------------------------------
create or replace function public.validate_coupon(p_code text, p_subtotal numeric)
returns table (code text, discount numeric, message text)
language plpgsql stable security definer set search_path = public as $$
declare c public.coupons; d numeric;
begin
  select * into c from public.coupons where upper(coupons.code) = upper(p_code) limit 1;
  if not found or not c.is_active then
    return query select p_code, 0::numeric, 'This code is not valid.'; return;
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return query select c.code, 0::numeric, 'This offer has not started yet.'; return;
  end if;
  if c.ends_at is not null and now() > c.ends_at then
    return query select c.code, 0::numeric, 'This offer has expired.'; return;
  end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then
    return query select c.code, 0::numeric, 'This offer has been fully redeemed.'; return;
  end if;
  if p_subtotal < c.min_order then
    return query select c.code, 0::numeric, 'Add items worth ₹' || (c.min_order - p_subtotal)::int || ' more to use this code.'; return;
  end if;
  if c.type = 'percent' then d := round(p_subtotal * c.value / 100); else d := c.value; end if;
  if c.max_discount is not null then d := least(d, c.max_discount); end if;
  d := least(d, p_subtotal);
  return query select c.code, d, 'Applied'::text;
end; $$;

-- ---------------------------------------------------------------------
--  ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.addresses      enable row level security;
alter table public.wishlist       enable row level security;
alter table public.coupons        enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.payments       enable row level security;
alter table public.shipments      enable row level security;
alter table public.reviews        enable row level security;
alter table public.store_settings enable row level security;

-- profiles
drop policy if exists "profiles self read"   on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
drop policy if exists "profiles admin all"   on public.profiles;
create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- customers can never promote themselves: role / block flag only change via an admin
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
  end if;
  return new;
end; $$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
  for each row execute function public.protect_profile_role();
create policy "profiles admin all"   on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- catalogue: public read, admin write
drop policy if exists "categories read"  on public.categories;
drop policy if exists "categories admin" on public.categories;
create policy "categories read"  on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products read"  on public.products;
drop policy if exists "products admin" on public.products;
create policy "products read"  on public.products for select using (is_active or public.is_admin());
create policy "products admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- addresses / wishlist: owner only
drop policy if exists "addresses owner" on public.addresses;
create policy "addresses owner" on public.addresses for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
drop policy if exists "wishlist owner" on public.wishlist;
create policy "wishlist owner" on public.wishlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- coupons: admin only (customers use validate_coupon RPC)
drop policy if exists "coupons admin" on public.coupons;
create policy "coupons admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- orders: owner read, admin everything. Inserts happen server-side with the service role.
drop policy if exists "orders owner read" on public.orders;
drop policy if exists "orders admin"      on public.orders;
create policy "orders owner read" on public.orders for select using (user_id = auth.uid());
create policy "orders admin"      on public.orders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items read"  on public.order_items;
drop policy if exists "order_items admin" on public.order_items;
create policy "order_items read"  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items admin" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "payments read"  on public.payments;
drop policy if exists "payments admin" on public.payments;
create policy "payments read"  on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "payments admin" on public.payments for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "shipments read"  on public.shipments;
drop policy if exists "shipments admin" on public.shipments;
create policy "shipments read"  on public.shipments for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "shipments admin" on public.shipments for all using (public.is_admin()) with check (public.is_admin());

-- reviews: approved are public, signed-in users submit (pending), admin moderates
drop policy if exists "reviews read"   on public.reviews;
drop policy if exists "reviews insert" on public.reviews;
drop policy if exists "reviews admin"  on public.reviews;
create policy "reviews read"   on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "reviews insert" on public.reviews for insert with check (auth.uid() = user_id and status = 'pending');
create policy "reviews admin"  on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings admin" on public.store_settings;
drop policy if exists "settings read"  on public.store_settings;
create policy "settings read"  on public.store_settings for select using (true);
create policy "settings admin" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
--  STORAGE bucket for product images (public read, admin write)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "product images read"  on storage.objects;
drop policy if exists "product images admin" on storage.objects;
create policy "product images read"  on storage.objects for select using (bucket_id = 'products');
create policy "product images admin" on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

-- ---------------------------------------------------------------------
--  MAKE YOURSELF ADMIN (after signing in once on the site):
--  update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------
