-- ============================================================
-- Baby's Bazaar — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  image text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  category_id uuid references categories(id) on delete set null,
  product_images text[] not null default '{}',
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PHOTOS
-- ============================================================
create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  image text not null,
  caption text,
  type text not null default 'delivery' check (type in ('delivery', 'event')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- REELS
-- ============================================================
create table if not exists reels (
  id uuid primary key default uuid_generate_v4(),
  video text not null,
  thumbnail text not null,
  title text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BANNERS
-- ============================================================
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  image text not null,
  heading text,
  button_text text,
  link text,
  display_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SETTINGS (single row)
-- ============================================================
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text,
  logo text,
  whatsapp_number text,
  phone text,
  email text,
  address text,
  updated_at timestamptz not null default now()
);

-- Insert default settings row
insert into settings (store_name, whatsapp_number)
values ('Baby''s Bazaar', '')
on conflict do nothing;

-- ============================================================
-- AUTO UPDATE updated_at TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_categories before update on categories for each row execute function update_updated_at();
create trigger set_updated_at_products before update on products for each row execute function update_updated_at();
create trigger set_updated_at_photos before update on photos for each row execute function update_updated_at();
create trigger set_updated_at_reels before update on reels for each row execute function update_updated_at();
create trigger set_updated_at_banners before update on banners for each row execute function update_updated_at();
create trigger set_updated_at_settings before update on settings for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table photos enable row level security;
alter table reels enable row level security;
alter table banners enable row level security;
alter table settings enable row level security;

-- PUBLIC: read active records only
create policy "Public read active categories" on categories for select using (status = 'active');
create policy "Public read active products" on products for select using (status = 'active');
create policy "Public read active photos" on photos for select using (status = 'active');
create policy "Public read active reels" on reels for select using (status = 'active');
create policy "Public read active banners" on banners for select using (status = 'active');
create policy "Public read settings" on settings for select using (true);

-- ADMIN: full access when authenticated
create policy "Admin full access categories" on categories for all using (auth.role() = 'authenticated');
create policy "Admin full access products" on products for all using (auth.role() = 'authenticated');
create policy "Admin full access photos" on photos for all using (auth.role() = 'authenticated');
create policy "Admin full access reels" on reels for all using (auth.role() = 'authenticated');
create policy "Admin full access banners" on banners for all using (auth.role() = 'authenticated');
create policy "Admin full access settings" on settings for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS
-- (Run separately or via Supabase Dashboard)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('products', 'products', true);
-- insert into storage.buckets (id, name, public) values ('categories', 'categories', true);
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
-- insert into storage.buckets (id, name, public) values ('reels', 'reels', true);
-- insert into storage.buckets (id, name, public) values ('banners', 'banners', true);
-- insert into storage.buckets (id, name, public) values ('settings', 'settings', true);
