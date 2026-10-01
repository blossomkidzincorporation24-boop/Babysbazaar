-- ==============================================================================
-- BABY'S BAZAAR — COMPLETE CLIENT SUPABASE MIGRATION & DATA RESTORE
-- Target Project: https://pyopqnrubhfknxsmuqkc.supabase.co
-- Cloudflare R2 Media: https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pyopqnrubhfknxsmuqkc/sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE SCHEMAS & TABLES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_images TEXT[] DEFAULT '{}',
  video_url TEXT,
  best_seller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  mobile_image TEXT,
  heading TEXT,
  subtitle TEXT,
  button_text TEXT,
  link TEXT,
  link_type TEXT DEFAULT 'internal',
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offer_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT DEFAULT 'FAMILY CRAFTED',
  image TEXT NOT NULL,
  mobile_image TEXT,
  button_text TEXT DEFAULT 'Shop Collection',
  button_link TEXT DEFAULT '/categories',
  background_color TEXT DEFAULT '#F40436',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  display_order INT DEFAULT 0,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL,
  caption TEXT,
  type TEXT DEFAULT 'delivery' CHECK (type IN ('delivery', 'event')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  badge_type TEXT DEFAULT 'ribbon' CHECK (badge_type IN ('ribbon', 'trust_badge')),
  display_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  bucket TEXT DEFAULT 'banners',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'Baby''s Bazaar',
  logo TEXT,
  whatsapp_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);

-- 4. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('photos', 'photos', true),
  ('reels', 'reels', true),
  ('banners', 'banners', true),
  ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Public Read
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

-- 5. RLS & HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public Select Policies
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin all categories" ON categories;
CREATE POLICY "Admin all categories" ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin all products" ON products;
CREATE POLICY "Admin all products" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read product_images" ON product_images;
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin all product_images" ON product_images;
CREATE POLICY "Admin all product_images" ON product_images FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read banners" ON banners;
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin all banners" ON banners;
CREATE POLICY "Admin all banners" ON banners FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read offer_banners" ON offer_banners;
CREATE POLICY "Public read offer_banners" ON offer_banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin all offer_banners" ON offer_banners;
CREATE POLICY "Admin all offer_banners" ON offer_banners FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read reels" ON reels;
CREATE POLICY "Public read reels" ON reels FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin all reels" ON reels;
CREATE POLICY "Admin all reels" ON reels FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read photos" ON photos;
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admin all photos" ON photos;
CREATE POLICY "Admin all photos" ON photos FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read delivery_features" ON delivery_features;
CREATE POLICY "Public read delivery_features" ON delivery_features FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin all delivery_features" ON delivery_features;
CREATE POLICY "Admin all delivery_features" ON delivery_features FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read media_assets" ON media_assets;
CREATE POLICY "Public read media_assets" ON media_assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin all media_assets" ON media_assets;
CREATE POLICY "Admin all media_assets" ON media_assets FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin all settings" ON settings;
CREATE POLICY "Admin all settings" ON settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can read own profile" ON admin_profiles;
CREATE POLICY "Admins can read own profile" ON admin_profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_profiles;
CREATE POLICY "Admins can update own profile" ON admin_profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read logs" ON activity_logs;
CREATE POLICY "Admins can read logs" ON activity_logs FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can insert logs" ON activity_logs;
CREATE POLICY "Admins can insert logs" ON activity_logs FOR INSERT WITH CHECK (is_admin());

-- 6. DATA RESTORE
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('df9313e5-5ecc-48fe-9e92-0a4a5e383c24', 'Activity & Puzzle', 'activity-and-puzzle', '[parent:toys] Brain games, jigsaw & mazes', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80', 'active', 10, NULL, '2026-09-30T09:45:16.280699+00:00', '2026-09-30T09:45:16.280699+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('665045f9-4d50-43d5-98d5-3f812961e738', 'Ride-On Toys', 'ride-on-toys', '[parent:toys] Foot-to-floor & battery rides', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80', 'active', 11, NULL, '2026-09-30T09:45:16.999581+00:00', '2026-09-30T09:45:16.999581+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('32203032-634c-463b-bd55-0cc4698645d4', 'Baby Bedding & Beds', 'baby-bedding-and-beds', NULL, NULL, 'active', 0, NULL, '2026-09-28T16:18:02.838868+00:00', '2026-09-30T01:23:36.441104+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('f5fc8dec-61b8-429c-ba99-29da87f6f407', 'Maternity & Nursing', 'maternity-and-nursing', NULL, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:16.526195+00:00', '2026-09-30T01:23:36.580045+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('c4d57266-439b-4abe-b949-1d972c5b3fcd', 'Baby Safety & Protection', 'baby-safety-and-protection', NULL, NULL, 'active', 0, NULL, '2026-09-26T14:36:16.21046+00:00', '2026-09-30T01:23:36.716839+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('78836ffe-42bf-4bd5-a47b-685f63b8ede8', 'Baby Travel & Strollers', 'baby-travel-and-strollers', NULL, 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:15.490814+00:00', '2026-09-30T01:23:36.851035+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('b5bf0909-8573-4e29-89de-f5b920bc531a', 'Baby Bath & Care', 'baby-bath-and-care', NULL, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:16.048006+00:00', '2026-09-30T01:23:37.018385+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('259e1c9f-3892-49fe-b0c1-1236310794e5', 'Baby Feeding', 'baby-feeding', NULL, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:16.367398+00:00', '2026-09-30T01:23:37.153948+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('8d93759e-d524-4f82-8c7d-aa7e61a676fe', 'Baby Walkers & Ride-Ons', 'baby-walkers-and-ride-ons', NULL, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:15.873685+00:00', '2026-09-30T01:23:37.285855+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('6f40fb4c-8a02-4ef1-bbcc-9705fb8af661', 'Baby Cycles & Tricycles', 'baby-cycles-and-tricycles', NULL, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&q=80', 'active', 0, NULL, '2026-09-26T14:36:15.66677+00:00', '2026-09-30T01:23:37.409116+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('c336adda-882d-4f52-8628-42deb2a1d55e', 'Clothing', 'clothing', NULL, 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&q=80', 'active', 0, NULL, '2026-09-27T06:33:05.627904+00:00', '2026-09-30T02:46:55.960824+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('a19633af-3496-46b0-b106-afd17b8bf18d', 'Baby Clothing', 'baby-clothing', NULL, 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&q=80', 'inactive', 0, NULL, '2026-09-26T14:36:15.237896+00:00', '2026-09-30T02:46:56.570573+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('f29d3bb4-ab0e-4170-8d2c-336609bffb91', 'Toys', 'toys', 'Explore our curated world of toys: baby toys, educational games, remote-control vehicles, building blocks, and cuddly soft toys.', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80', 'active', 1, NULL, '2026-09-30T09:45:11.758737+00:00', '2026-09-30T09:45:11.758737+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('5a5ccacd-6fb6-4dd6-b560-d64c4ecba4bc', 'Baby Toys', 'baby-toys', '[parent:toys] Sensory & newborn toys', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80', 'active', 1, NULL, '2026-09-30T09:45:12.262593+00:00', '2026-09-30T09:45:12.262593+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('88405029-be97-4b8f-b4c3-1ecc1fa57f72', 'Educational Toys', 'educational-toys', '[parent:toys] Learning & STEM', 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', 'active', 2, NULL, '2026-09-30T09:45:12.783545+00:00', '2026-09-30T09:45:12.783545+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('e4fc8016-692a-4409-9aa6-b79fd20f325a', 'Remote Control Toys', 'remote-control-toys', '[parent:toys] RC cars, bikes & drones', 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&q=80', 'active', 3, NULL, '2026-09-30T09:45:13.179129+00:00', '2026-09-30T09:45:13.179129+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('09844915-39c2-4ba2-b57f-8a0a1541bf9a', 'Cars & Vehicles', 'cars-and-vehicles', '[parent:toys] Die-cast, tracks & speedsters', 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&q=80', 'active', 4, NULL, '2026-09-30T09:45:13.622978+00:00', '2026-09-30T09:45:13.622978+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('1c74604a-78c5-4617-be2e-3aaab598a0f6', 'Dolls & Pretend Play', 'dolls-and-pretend-play', '[parent:toys] Kitchen sets & roleplay', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80', 'active', 5, NULL, '2026-09-30T09:45:14.101018+00:00', '2026-09-30T09:45:14.101018+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('aed48eee-adae-4988-8e7f-4bf546a23b14', 'Building Toys', 'building-toys', '[parent:toys] Blocks, bricks & engineering', 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80', 'active', 6, NULL, '2026-09-30T09:45:14.52085+00:00', '2026-09-30T09:45:14.52085+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('791b56db-a42c-4803-b547-f9fe5ebfcf1d', 'Musical Toys', 'musical-toys', '[parent:toys] Xylophones, pianos & beats', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', 'active', 7, NULL, '2026-09-30T09:45:14.938286+00:00', '2026-09-30T09:45:14.938286+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('810e66b1-b4e1-461f-92c7-b23fc87f152a', 'Outdoor Toys', 'outdoor-toys', '[parent:toys] Sports, bubbles & garden fun', 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&q=80', 'active', 8, NULL, '2026-09-30T09:45:15.34572+00:00', '2026-09-30T09:45:15.34572+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES ('d38225b6-c577-40df-be7b-40fc17b73a0d', 'Soft Toys', 'soft-toys', '[parent:toys] Plushies, teddy bears & cuddles', 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&q=80', 'active', 9, NULL, '2026-09-30T09:45:15.847921+00:00', '2026-09-30T09:45:15.847921+00:00') ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('b029f208-70e4-4065-8d29-8d61332ee2a2', 'floral-crossover-v-neck-maternity-nursing-maxi-dress', 'Floral Crossover V-Neck Maternity & Nursing Maxi Dress', NULL, 'Effortless style and comfort from pregnancy through postpartum nursing.', 599, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/d4478fb3-bf1f-429a-8495-39274f80e86e.jpg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-28T14:18:16.946636+00:00', '2026-09-28T14:18:16.946636+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('8ae75d7e-e4f2-4e42-aa39-2186e8e2ec68', 'everyday-crossover-nursing-top', 'Everyday Crossover Nursing Top', NULL, 'Designed for everyday ease from pregnancy to postpartum', 500, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/3352aa84-c59b-41fa-8643-906925b96d4c.jpg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-28T14:39:18.562337+00:00', '2026-09-28T14:39:18.562337+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('6beee874-5dc3-44e7-9bd8-500edca27283', 'ergonomic-velvet-u-shape-maternity', 'Ergonomic Velvet U-Shape Maternity', NULL, 'Designed for deep, restorative rest throughout every trimester and beyond', 500, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/c2403a04-e229-4f32-9e79-400636065365.jpg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-28T14:45:23.722856+00:00', '2026-09-28T14:45:23.722856+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('2a594af7-3ed8-4a1c-8ccc-c8605d2e1d2a', 'breast-pumbs', 'Breast Pumbs', NULL, NULL, 34000, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1739df94-f0a4-4f3a-ab58-2be3cffbb8eb.jpg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-28T15:14:44.47513+00:00', '2026-09-28T15:14:44.47513+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('70269ba7-5e54-4f08-904d-cfe5ce47ff8c', 'electrical-pumb', 'Electrical Pumb', NULL, 'electrical', 50000, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/e4d8bdbc-8110-4c04-bc20-8fd5e4083be1.jpg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-28T15:21:01.608161+00:00', '2026-09-28T15:21:01.608161+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('936ebfa1-30ac-45ef-8951-7adeb9933837', 'baby-net-bed', 'Baby Net Bed', NULL, 'A comfortable baby net bed designed with a soft sleeping surface and protective netting for a cozy resting space. Lightweight, comfortable, and suitable for creating a peaceful nursery environment.', 500, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b043c23b-a20d-42e4-8950-cbd84182093c.jpeg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-28T16:22:17.236662+00:00', '2026-09-28T16:22:17.236662+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('90502ba2-43d8-45c7-9fc5-cdde6faf38e9', 'cozy-baby-bed-with-side-pillows', 'Cozy Baby Bed with Side Pillows', NULL, 'Comfortable baby bed featuring soft padded side pillows for a cozy sleeping environment. Designed with a simple and elegant look for modern nurseries.', 600, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/efb72672-996e-4ea8-9bf0-c0190be67ed1.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-28T16:29:38.211736+00:00', '2026-09-28T16:29:38.211736+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('f6969451-0d6d-4585-821e-6eeeaef6ea8e', 'soft-baby-pillow', 'Soft Baby Pillow', NULL, 'Soft and comfortable baby pillow with a gentle fabric surface, designed to complement a cozy nursery bedding setup', 300, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/ed36e458-4d31-42b5-838b-f624fc46eb66.jpeg"}', NULL, FALSE, TRUE, FALSE, 'active', 0, '2026-09-28T16:31:22.96528+00:00', '2026-09-28T16:31:22.96528+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('d177f6c4-7cac-429e-9853-99da54324ceb', 'baby-neck-pillow', 'Baby Neck Pillow', NULL, 'Soft U-shaped neck pillow designed to provide gentle head and neck support with a comfortable, baby-friendly fabric.', 350, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/801ccf5c-2382-4eaa-a056-abf1f1c170c5.jpeg"}', NULL, TRUE, TRUE, FALSE, 'active', 0, '2026-09-28T16:34:15.810631+00:00', '2026-09-28T16:34:15.810631+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('a81cdd13-f1bc-41be-9711-0f6045bf1f70', 'lotus-baby-bed-with-pillow', 'Lotus Baby Bed with Pillow', NULL, 'A cozy lotus-shaped baby bed with soft cushioned pillows around the sides, designed to create a comfortable and snug sleeping space. Its rounded lotus-inspired design gives the bed a soft, elegant look that suits modern nurseries.', 500, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/ebb05d44-ddb1-4274-bc54-4702a4ccaeba.jpeg"}', NULL, FALSE, TRUE, FALSE, 'active', 0, '2026-09-28T16:39:57.1519+00:00', '2026-09-28T16:39:57.1519+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('ab548927-c88b-495d-bf7d-3820661a4c53', 'car', 'Car', NULL, NULL, 350, '8d93759e-d524-4f82-8c7d-aa7e61a676fe', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/15c86242-53ef-4d7c-8d2b-4c27161308ad.jpg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-29T13:58:53.248413+00:00', '2026-09-29T13:58:53.248413+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('39fb8812-d0b3-4195-aee3-504d334fb5f9', 'baby-bed-protector', 'Baby Bed Protector', NULL, 'Soft and practical bed protector designed to help protect the mattress from spills and moisture while keeping the sleeping surface comfortable.', 500, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/696e897c-4f1c-4bbe-b1ed-1c4ff0c000f5.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-28T16:27:02.203328+00:00', '2026-09-30T01:23:38.074363+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('f34ffc43-88ee-4f93-a830-2fdc09b956e0', 'baby-wooden-cot-bed-with-guard-rail', 'Baby Wooden Cot Bed with Guard Rail', NULL, 'Comfortable baby bed featuring soft padded side pillows for a cozy sleeping environment. Designed with a simple and elegant look for modern nurseries', 500, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1addef04-4544-469e-91aa-9147824d083b.jpeg"}', NULL, FALSE, TRUE, FALSE, 'active', 0, '2026-09-28T16:23:47.541268+00:00', '2026-09-30T01:23:37.534438+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('464465af-3b26-4e9e-bfe9-8b9a4f9592ae', 'cotton-maternity-feeding-nighty', 'Cotton Maternity Feeding Nighty', NULL, 'Comfortable feeding nighty designed for pregnancy and postpartum nursing.', 500, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/e4db1490-5bee-4274-974b-e2f4dbf4a7b9.jpg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-28T14:56:21.373301+00:00', '2026-09-30T01:23:37.686429+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('8f82bee8-b1c2-499f-b919-7c052c36861a', 'soft-baby-cradle-cloth', 'Soft Baby Cradle Cloth', NULL, 'Soft and comfortable cradle cloth made for creating a cozy sleeping space for your little one. Lightweight, gentle, and suitable for everyday use.', 450, '32203032-634c-463b-bd55-0cc4698645d4', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1af82de5-840b-4e1a-9f35-5af782ad1e9e.jpeg"}', NULL, FALSE, TRUE, FALSE, 'active', 0, '2026-09-28T16:36:43.173754+00:00', '2026-09-30T01:23:37.81165+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('ebda0afb-7f6c-41d0-ac54-5711ad984177', 'feeding-bed', 'Feeding Bed', NULL, 'Comfortable feeding bed designed for use after childbirth.', 600, 'f5fc8dec-61b8-429c-ba99-29da87f6f407', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/a664c44d-30fb-429d-976f-73492e19081f.jpg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-28T15:05:02.548197+00:00', '2026-09-30T01:23:37.940106+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('29e03f40-955b-488f-b0d3-ad025344dad9', 'baby-cotton-romper', 'Baby Cotton Romper', '1–3 Months, 3–6 Months', 'Soft and comfortable cotton romper designed for little ones'' everyday wear.', 350, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/3cc4f7d6-e981-4fc1-847b-4eca896715c4.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T04:23:09.902006+00:00', '2026-09-30T04:23:09.902006+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('c5f8a107-884d-4b3f-9121-9b60afca8f64', 'jabla', 'Jabla', '1–3 Months, 3–6 Months, 6–12 Months', 'Keep your little one comfortable with our soft and gentle Datter Jabla, specially designed for newborns. Made with baby-friendly fabric and a comfortable wrap-style design', 450, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b5837b7d-9a56-4073-9115-c276d00273e9.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T03:08:01.762956+00:00', '2026-09-30T03:36:38.836558+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('0777825b-eb34-4744-87c5-6d8617c86ee8', 'soft-cotton-baby-clothes', 'Soft Cotton Baby Clothes', '1–3 Months, 3–6 Months', 'Comfortable and gentle everyday clothing designed for little ones. Made with soft, lightweight fabric to provide a cozy feel and comfortable movement throughout the day.', 350, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/4907ab99-3464-4320-a2f7-5a9ddb2f86fb.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T04:21:47.763191+00:00', '2026-09-30T04:21:47.763191+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('7abf009b-94e1-4ba2-9606-b2ac400cf549', 'baby-cotton-frock', 'Baby Cotton Frock', '18–24 Months, 12–18 Months, 6–12 Months', 'v', 400, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b96bec86-dd83-42af-ad74-3b6639839529.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T04:24:34.162286+00:00', '2026-09-30T04:24:34.162286+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('cdc36566-534b-4e79-bbc0-8352bfae077e', 'baby-mosquito-net', 'Baby Mosquito Net', NULL, 'Soft and breathable mosquito net designed to provide a comfortable, protected sleeping space for babies.', 450, 'c4d57266-439b-4abe-b949-1d972c5b3fcd', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/635c2eeb-5551-4064-b800-a71937496707.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T04:28:53.697621+00:00', '2026-09-30T04:28:53.697621+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('0e2c5a9e-12aa-4d10-8341-825fbe2bfe1e', 'baby-mosquito-umbrella-net', 'Baby Mosquito Umbrella Net', NULL, 'Lightweight umbrella-style mosquito net designed to help protect babies from mosquitoes and insects during sleep and rest.', 500, 'c4d57266-439b-4abe-b949-1d972c5b3fcd', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/abd6f2f4-4ba1-4941-8ef8-a1d50966a208.jpeg"}', NULL, FALSE, FALSE, FALSE, 'active', 0, '2026-09-30T04:33:56.242919+00:00', '2026-09-30T04:33:56.242919+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('3dd8eb38-50ea-41b3-9b4d-e5a615d8914f', 'net', 'NET', '1–3 Months, 3–6 Months', 'NET IS THE N', 500, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/83e5b22a-3990-4d4a-8963-a9c6558723fd.jpeg"}', NULL, TRUE, FALSE, FALSE, 'active', 0, '2026-09-30T05:48:23.06713+00:00', '2026-09-30T05:48:59.598046+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES ('5822c768-8caa-4c90-9a8a-597c2faf6a49', 'net2o', 'net2,o', NULL, NULL, 500, 'c336adda-882d-4f52-8628-42deb2a1d55e', '{"https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/103e97fd-10b9-4d84-8050-e6abeacdba6c.jpeg"}', NULL, TRUE, TRUE, FALSE, 'active', 0, '2026-09-30T06:55:39.054323+00:00', '2026-09-30T06:55:39.054323+00:00') ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('0c9ed67e-9361-4d49-8713-d63b31194b09', 'b029f208-70e4-4065-8d29-8d61332ee2a2', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/d4478fb3-bf1f-429a-8495-39274f80e86e.jpg', 'Floral Crossover V-Neck Maternity & Nursing Maxi Dress', 0, TRUE, '2026-09-28T14:18:17.167726+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('b29935dc-ddb2-43b9-b301-1b56d0bbb1df', '8ae75d7e-e4f2-4e42-aa39-2186e8e2ec68', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/3352aa84-c59b-41fa-8643-906925b96d4c.jpg', 'Everyday Crossover Nursing Top', 0, TRUE, '2026-09-28T14:39:18.973222+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('ab2fa4b9-4c97-491f-9439-982ef6209e1e', '6beee874-5dc3-44e7-9bd8-500edca27283', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/c2403a04-e229-4f32-9e79-400636065365.jpg', 'Ergonomic Velvet U-Shape Maternity', 0, TRUE, '2026-09-28T14:45:23.933164+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('d778b0a0-dbf4-4db8-84f7-c45baa3b7d5c', '464465af-3b26-4e9e-bfe9-8b9a4f9592ae', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/e4db1490-5bee-4274-974b-e2f4dbf4a7b9.jpg', 'Feeding Nigty', 0, TRUE, '2026-09-28T14:56:21.640057+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('b59d38a4-a761-49d1-992c-6e51e02742cb', 'ebda0afb-7f6c-41d0-ac54-5711ad984177', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/a664c44d-30fb-429d-976f-73492e19081f.jpg', 'Feeding Bed', 0, TRUE, '2026-09-28T15:05:02.74364+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('56d72273-910a-41c5-a162-b89244808d03', '2a594af7-3ed8-4a1c-8ccc-c8605d2e1d2a', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1739df94-f0a4-4f3a-ab58-2be3cffbb8eb.jpg', 'Breast Pumbs', 0, TRUE, '2026-09-28T15:14:44.722929+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('106bd80c-8b8f-40a9-bef2-8224809b9cf1', '70269ba7-5e54-4f08-904d-cfe5ce47ff8c', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/e4d8bdbc-8110-4c04-bc20-8fd5e4083be1.jpg', 'Electrical Pumb', 0, TRUE, '2026-09-28T15:21:01.985615+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('bb36cd2a-b3bd-475d-b4ed-8613e7fe0c31', '936ebfa1-30ac-45ef-8951-7adeb9933837', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b043c23b-a20d-42e4-8950-cbd84182093c.jpeg', 'Baby Net Bed', 0, TRUE, '2026-09-28T16:22:17.470368+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('cd1b2ac3-6c60-4ba5-a33c-1a0b202e10bf', 'f34ffc43-88ee-4f93-a830-2fdc09b956e0', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1addef04-4544-469e-91aa-9147824d083b.jpeg', 'Crawling', 0, TRUE, '2026-09-28T16:24:58.34374+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('7bb88f36-e1f9-401b-9f93-877c8d93d05e', '39fb8812-d0b3-4195-aee3-504d334fb5f9', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/696e897c-4f1c-4bbe-b1ed-1c4ff0c000f5.jpeg', 'Baby Bed Protector', 0, TRUE, '2026-09-28T16:27:02.386783+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('601f2a45-c170-4d89-a26e-c148114dac00', '90502ba2-43d8-45c7-9fc5-cdde6faf38e9', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/efb72672-996e-4ea8-9bf0-c0190be67ed1.jpeg', 'Cozy Baby Bed with Side Pillows', 0, TRUE, '2026-09-28T16:29:38.405392+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('151ab0af-2673-44c4-9f4c-f70d2d239dda', 'f6969451-0d6d-4585-821e-6eeeaef6ea8e', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/ed36e458-4d31-42b5-838b-f624fc46eb66.jpeg', 'Soft Baby Pillow', 0, TRUE, '2026-09-28T16:31:23.138791+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('becbb9c1-fca6-4163-8547-eddd937eb4c5', 'd177f6c4-7cac-429e-9853-99da54324ceb', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/801ccf5c-2382-4eaa-a056-abf1f1c170c5.jpeg', 'Baby Neck Pillow', 0, TRUE, '2026-09-28T16:34:16.059061+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('1ab99fe4-b7c9-487d-bcf2-208ee42eb070', 'a81cdd13-f1bc-41be-9711-0f6045bf1f70', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/ebb05d44-ddb1-4274-bc54-4702a4ccaeba.jpeg', 'Lotus Baby Bed with Pillow', 0, TRUE, '2026-09-28T16:39:57.32233+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('35c16c87-7ce9-4e05-ba50-6874ab5ee9ef', 'ab548927-c88b-495d-bf7d-3820661a4c53', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/15c86242-53ef-4d7c-8d2b-4c27161308ad.jpg', 'Car', 0, TRUE, '2026-09-29T13:58:53.93123+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('2269b100-4a05-4954-9d3b-f9ab92fc9fad', '8f82bee8-b1c2-499f-b919-7c052c36861a', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/1af82de5-840b-4e1a-9f35-5af782ad1e9e.jpeg', 'Soft Baby Cradle Cloth', 0, TRUE, '2026-09-29T14:02:38.833264+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('0ad073de-dcc7-4352-8e13-7e0dfedb66a9', 'c5f8a107-884d-4b3f-9121-9b60afca8f64', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b5837b7d-9a56-4073-9115-c276d00273e9.jpeg', 'Jabla', 0, TRUE, '2026-09-30T03:36:39.75205+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('3e2ec31f-6364-4b90-b51b-3b2f8beb78e2', '0777825b-eb34-4744-87c5-6d8617c86ee8', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/4907ab99-3464-4320-a2f7-5a9ddb2f86fb.jpeg', 'Soft Cotton Baby Clothes', 0, TRUE, '2026-09-30T04:21:48.462518+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('f0f42c42-a1ec-4aff-8e5e-caa3f5158b4b', '29e03f40-955b-488f-b0d3-ad025344dad9', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/3cc4f7d6-e981-4fc1-847b-4eca896715c4.jpeg', 'Baby Cotton Romper', 0, TRUE, '2026-09-30T04:23:10.16552+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('3902255a-6d77-4219-9969-556a81d5714c', '7abf009b-94e1-4ba2-9606-b2ac400cf549', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/b96bec86-dd83-42af-ad74-3b6639839529.jpeg', 'Baby Cotton Frock', 0, TRUE, '2026-09-30T04:24:34.833582+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('eb7e9ec7-a9a4-4054-b5d6-fb7da18373b0', 'cdc36566-534b-4e79-bbc0-8352bfae077e', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/635c2eeb-5551-4064-b800-a71937496707.jpeg', 'Baby Mosquito Net', 0, TRUE, '2026-09-30T04:28:53.956382+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('4e8b065b-4e82-428c-a920-e4792bc71b11', '0e2c5a9e-12aa-4d10-8341-825fbe2bfe1e', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/abd6f2f4-4ba1-4941-8ef8-a1d50966a208.jpeg', 'Baby Mosquito Umbrella Net', 0, TRUE, '2026-09-30T04:33:56.932708+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('81a1963c-92bf-48a8-9fed-d3cc7e48996d', '3dd8eb38-50ea-41b3-9b4d-e5a615d8914f', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/83e5b22a-3990-4d4a-8963-a9c6558723fd.jpeg', 'NET', 0, TRUE, '2026-09-30T05:49:00.063709+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES ('84a6a93f-5986-498d-9a0c-6e1e628256d2', '5822c768-8caa-4c90-9a8a-597c2faf6a49', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/products/103e97fd-10b9-4d84-8050-e6abeacdba6c.jpeg', 'net2,o', 0, TRUE, '2026-09-30T06:55:39.330688+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES ('26c9d18f-7842-4efe-be05-e9607ce661ad', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/banners/6b67eccc-7c21-4d2e-bbd8-1f02b070cd4f.png', NULL, 'Everything a Mom Needs', 'Shop Now', 'Browse Collection', '/categories', 'internal', 1, 'active', '2026-09-28T09:40:18.503131+00:00', '2026-09-30T01:23:35.877136+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES ('f4151501-469f-4ba1-b529-c09108329abd', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/banners/18fac1a4-6c8f-4a7a-a40b-ee9e9deae691.png', NULL, 'Everything Your Little One Needs', NULL, 'Browse Collection', '/categories', 'internal', 1, 'active', '2026-09-28T09:49:20.472008+00:00', '2026-09-30T01:23:36.178325+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES ('a53510b2-6654-4079-8348-ef60afc05e8b', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/banners/f2b86d47-9e7e-4a47-b0de-614c09874fbb.png', NULL, 'Everything Is Here for Your Little One', NULL, 'Browse Collection', '/categories', 'internal', 1, 'active', '2026-09-28T09:50:31.280389+00:00', '2026-09-30T01:23:36.30345+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES ('9ed750c8-8d0f-4a45-8928-32084fc39f79', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80', NULL, 'Gentle Threads for Tender Skin', NULL, 'Explore Spring Collection', '/categories', 'internal', 2, 'inactive', '2026-09-26T14:36:17.730379+00:00', '2026-09-28T06:04:45.968812+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES ('95b6c890-6600-48f8-a30a-14deaaaa2986', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/banners/b92c6e73-a520-49e3-893e-81ae42dda3c3.png', NULL, 'Everything your Mom', 'shop Now', 'Get your Product', '/categories', 'internal', 1, 'inactive', '2026-09-28T09:36:00.091648+00:00', '2026-09-28T09:48:04.893562+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO offer_banners (id, title, subtitle, badge_text, image, mobile_image, button_text, button_link, background_color, display_order, status) VALUES ('568cca38-9a44-4d79-b7c8-652d9e428b60', 'Everything Little, Made Affordable', NULL, 'FAMILY CRAFTED', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/banners/3894fc53-f862-4159-8e33-cdde811fcde8.png', NULL, 'Shop Collection', '/categories', '#F40436', 1, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO reels (id, video, thumbnail, title, subtitle, display_order, product_id, status) VALUES ('c32ca36c-d0a4-42f5-a541-085c50ef6c94', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/e6b59006-a4d2-4d9c-81ae-02c59a1570cc.mp4', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/4f7cdbf3-c11d-4cf8-906d-09cec6141432.png', 'Upcoming Product', NULL, 0, NULL, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO reels (id, video, thumbnail, title, subtitle, display_order, product_id, status) VALUES ('db89df43-2f62-4513-a280-bba264dd33d7', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/7adede98-92b5-4c04-b6c9-66add17be2d9.mp4', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/9c75d0c0-3d54-4f0e-887e-62642eea7b71.png', 'classic Review', NULL, 0, NULL, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO reels (id, video, thumbnail, title, subtitle, display_order, product_id, status) VALUES ('374cb546-4576-4932-95b0-d25110dda295', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/114111fd-42fd-4a2f-b052-393023ce1af2.mp4', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/e2546b3b-601e-4654-a63a-76a37c37d2c3.png', 'Happy customer', NULL, 0, NULL, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO reels (id, video, thumbnail, title, subtitle, display_order, product_id, status) VALUES ('ee0230b1-befb-4e6d-9a3d-88baa0cccace', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/a4b354b8-7e70-44a5-a5cb-385d8f0f1db0.mp4', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/reels/c0fa7410-6a0e-40ac-b021-dd580b74dcb2.png', 'Happy Customer', NULL, 0, NULL, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO photos (id, image, caption, type, status) VALUES ('e90911dd-06cb-4313-a828-581af89959e2', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/photos/9588bfff-6842-4357-ac41-6bce28a5721e.jpeg', 'Delivery with Happ Mode', 'delivery', 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO photos (id, image, caption, type, status) VALUES ('d99ed7b4-cfdd-406c-a0de-091bb4b6b310', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/photos/e2936a1d-e122-46d2-a22a-150b48608e45.jpeg', 'Happy Moment', 'delivery', 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO photos (id, image, caption, type, status) VALUES ('a8a25f95-55fb-4eb5-ad0c-dbaa9f1b6b30', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/photos/e9dd0fce-ddec-4734-b5eb-27d78b2c114c.jpeg', 'our Real Asset', 'delivery', 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO photos (id, image, caption, type, status) VALUES ('a4ffd5d4-d0e0-4402-a214-6748b5fd3362', 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev/photos/29eaf25f-32f6-40c4-97c7-60b254c17709.jpeg', 'Our Delievry Mode', 'delivery', 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('9e016358-9e40-4e0b-8256-a7beae20d72e', 'Free Shipping on Orders above ₹3500', NULL, '✨', 'ribbon', 1, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('85114a60-ddc1-4b7c-a10c-4803f61ca24c', 'Shipping across INDIA', NULL, '🚚', 'ribbon', 3, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('4fde84af-a471-4def-9bd4-965b21ad933b', 'For international and wholesale orders DM us', NULL, '🌍', 'ribbon', 4, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('8a747c5f-61fc-48ef-a980-115fa2c52430', 'WhatsApp Concierge', 'Instant size advice, photos & real-time care', 'MessageCircle', 'trust_badge', 1, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('419976cf-db89-4906-af1d-055fabc65639', 'Pan-India Dispatch', 'Insured doorstep parcel dispatch in 24 hrs', 'Truck', 'trust_badge', 2, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('71a94d6d-4db7-44d5-a289-c62b43234621', 'Personalized Gifting', 'Handcrafted keepsake boxes & calligraphy', 'Gift', 'trust_badge', 3, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES ('0f19cfda-3db7-4ef0-997c-48ab042cd93d', 'Fast dispatch within 24-48 hours across India', NULL, '📦', 'ribbon', 2, 'active') ON CONFLICT (id) DO NOTHING;
INSERT INTO settings (id, store_name, logo, whatsapp_number, phone, email, address) VALUES ('6696d57d-b6f6-422b-aaa2-85200ba7d2a3', 'Baby''s Bazaar', NULL, '918489824888', '+91 84898 24888', NULL, '160, Perundurai Road, Near Sudha Hospital, Edayankattuvalasu, Erode, Tamil Nadu 638011') ON CONFLICT (id) DO NOTHING;
