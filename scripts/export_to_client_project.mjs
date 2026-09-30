import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  if (Array.isArray(val)) {
    const arr = val.map(v => '"' + v.replace(/"/g, '""') + '"').join(',');
    return "'{" + arr + "}'";
  }
  return "'" + val.replace(/'/g, "''") + "'";
}

async function run() {
  const tables = ['categories', 'products', 'product_images', 'banners', 'offer_banners', 'reels', 'photos', 'delivery_features', 'media_assets', 'settings'];
  const dump = {};
  for (const t of tables) {
    const { data } = await supabase.from(t).select('*');
    dump[t] = data || [];
  }

  let sql = `-- ==============================================================================
-- BABY'S BAZAAR — COMPLETE CLIENT SUPABASE MIGRATION & DATA RESTORE
-- Target Project: https://pyopqnrubhfknxsmuqkc.supabase.co
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
`;

  // Insert parent categories first (where parent_id is null)
  const parents = dump.categories.filter(c => !c.parent_id);
  const children = dump.categories.filter(c => c.parent_id);

  for (const c of [...parents, ...children]) {
    sql += `INSERT INTO categories (id, name, slug, description, image, status, sort_order, parent_id, created_at, updated_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, ${escapeSql(c.status)}, ${escapeSql(c.sort_order)}, ${escapeSql(c.parent_id)}, ${escapeSql(c.created_at)}, ${escapeSql(c.updated_at)}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, image=EXCLUDED.image, status=EXCLUDED.status, sort_order=EXCLUDED.sort_order, parent_id=EXCLUDED.parent_id;\n`;
  }

  for (const p of dump.products) {
    sql += `INSERT INTO products (id, slug, title, short_description, description, price, category_id, product_images, video_url, best_seller, new_arrival, featured, status, sort_order, created_at, updated_at) VALUES (${escapeSql(p.id)}, ${escapeSql(p.slug)}, ${escapeSql(p.title)}, ${escapeSql(p.short_description)}, ${escapeSql(p.description)}, ${escapeSql(p.price)}, ${escapeSql(p.category_id)}, ${escapeSql(p.product_images)}, ${escapeSql(p.video_url)}, ${escapeSql(p.best_seller)}, ${escapeSql(p.new_arrival)}, ${escapeSql(p.featured)}, ${escapeSql(p.status)}, ${escapeSql(p.sort_order)}, ${escapeSql(p.created_at)}, ${escapeSql(p.updated_at)}) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, price=EXCLUDED.price, product_images=EXCLUDED.product_images, short_description=EXCLUDED.short_description;\n`;
  }

  for (const pi of dump.product_images) {
    sql += `INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary, created_at) VALUES (${escapeSql(pi.id)}, ${escapeSql(pi.product_id)}, ${escapeSql(pi.image_url)}, ${escapeSql(pi.alt_text)}, ${escapeSql(pi.sort_order)}, ${escapeSql(pi.is_primary)}, ${escapeSql(pi.created_at)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const b of dump.banners) {
    sql += `INSERT INTO banners (id, image, mobile_image, heading, subtitle, button_text, link, link_type, display_order, status, created_at, updated_at) VALUES (${escapeSql(b.id)}, ${escapeSql(b.image)}, ${escapeSql(b.mobile_image)}, ${escapeSql(b.heading)}, ${escapeSql(b.subtitle)}, ${escapeSql(b.button_text)}, ${escapeSql(b.link)}, ${escapeSql(b.link_type)}, ${escapeSql(b.display_order)}, ${escapeSql(b.status)}, ${escapeSql(b.created_at)}, ${escapeSql(b.updated_at)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const ob of dump.offer_banners) {
    sql += `INSERT INTO offer_banners (id, title, subtitle, badge_text, image, mobile_image, button_text, button_link, background_color, display_order, status) VALUES (${escapeSql(ob.id)}, ${escapeSql(ob.title)}, ${escapeSql(ob.subtitle)}, ${escapeSql(ob.badge_text)}, ${escapeSql(ob.image)}, ${escapeSql(ob.mobile_image)}, ${escapeSql(ob.button_text)}, ${escapeSql(ob.button_link)}, ${escapeSql(ob.background_color)}, ${escapeSql(ob.display_order)}, ${escapeSql(ob.status)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const r of dump.reels) {
    sql += `INSERT INTO reels (id, video, thumbnail, title, subtitle, display_order, product_id, status) VALUES (${escapeSql(r.id)}, ${escapeSql(r.video)}, ${escapeSql(r.thumbnail)}, ${escapeSql(r.title)}, ${escapeSql(r.subtitle)}, ${escapeSql(r.display_order)}, ${escapeSql(r.product_id)}, ${escapeSql(r.status)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const ph of dump.photos) {
    sql += `INSERT INTO photos (id, image, caption, type, status) VALUES (${escapeSql(ph.id)}, ${escapeSql(ph.image)}, ${escapeSql(ph.caption)}, ${escapeSql(ph.type)}, ${escapeSql(ph.status)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const df of dump.delivery_features) {
    sql += `INSERT INTO delivery_features (id, title, description, icon, badge_type, display_order, status) VALUES (${escapeSql(df.id)}, ${escapeSql(df.title)}, ${escapeSql(df.description)}, ${escapeSql(df.icon)}, ${escapeSql(df.badge_type)}, ${escapeSql(df.display_order)}, ${escapeSql(df.status)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  for (const s of dump.settings) {
    sql += `INSERT INTO settings (id, store_name, logo, whatsapp_number, phone, email, address) VALUES (${escapeSql(s.id)}, ${escapeSql(s.store_name)}, ${escapeSql(s.logo)}, ${escapeSql(s.whatsapp_number)}, ${escapeSql(s.phone)}, ${escapeSql(s.email)}, ${escapeSql(s.address)}) ON CONFLICT (id) DO NOTHING;\n`;
  }

  fs.writeFileSync('supabase/CLIENT_PROJECT_RESTORE.sql', sql);
  console.log('SUCCESS: Generated supabase/CLIENT_PROJECT_RESTORE.sql with size ' + sql.length + ' bytes');
}

run();
