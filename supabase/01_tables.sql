-- ============================================================
-- Baby's Bazaar — PART 1: TABLES
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_images TEXT[] NOT NULL DEFAULT '{}',
  best_seller BOOLEAN NOT NULL DEFAULT false,
  new_arrival BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PHOTOS
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  caption TEXT,
  "type" TEXT NOT NULL DEFAULT 'delivery' CHECK ("type" IN ('delivery', 'event')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- REELS
CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BANNERS
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  heading TEXT,
  button_text TEXT,
  link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SETTINGS (single row)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT,
  logo TEXT,
  whatsapp_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO settings (store_name, whatsapp_number)
VALUES ('Baby''s Bazaar', '')
ON CONFLICT DO NOTHING;
