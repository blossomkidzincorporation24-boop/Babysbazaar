-- STAGE 1: ADD MISSING COLUMNS
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- STAGE 1: CREATE NEW TABLES
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

-- STAGE 1: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);

-- STAGE 3: CREATE ADMIN PROFILE (using ID found during safety check)
INSERT INTO admin_profiles (id, full_name, role)
VALUES ('13353159-064b-496b-b65f-a887f6afef58', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- STAGE 4 & 5: DATA BACKFILL (Slugs & Images)
-- Generate slugs for existing products
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'), '[\s-]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

UPDATE products SET slug = generate_slug(title) WHERE slug IS NULL;

-- Migrate existing product_images array to product_images table safely
DO $$
DECLARE
  prod_record RECORD;
  img TEXT;
  idx INTEGER;
BEGIN
  FOR prod_record IN SELECT id, product_images FROM products WHERE product_images IS NOT NULL AND array_length(product_images, 1) > 0
  LOOP
    idx := 0;
    FOREACH img IN ARRAY prod_record.product_images
    LOOP
      INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
      VALUES (prod_record.id, img, idx, (idx = 0));
      idx := idx + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- STAGE 2: ADMIN SECURITY & RLS POLICIES

-- Helper function for admin check
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_profiles;
CREATE POLICY "Admins can read own profile" ON admin_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can update own profile" ON admin_profiles FOR UPDATE USING (id = auth.uid());

-- Apply to activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON activity_logs;
CREATE POLICY "Admins can read logs" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert logs" ON activity_logs FOR INSERT WITH CHECK (is_admin());

-- Apply to products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Admin full access products" ON products;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Admin all products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all products" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product_images" ON product_images;
DROP POLICY IF EXISTS "Admin all product_images" ON product_images;
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admin all product_images" ON product_images FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active categories" ON categories;
DROP POLICY IF EXISTS "Admin full access categories" ON categories;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin all categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all categories" ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active photos" ON photos;
DROP POLICY IF EXISTS "Admin full access photos" ON photos;
DROP POLICY IF EXISTS "Public read photos" ON photos;
DROP POLICY IF EXISTS "Admin all photos" ON photos;
CREATE POLICY "Public read photos" ON photos FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all photos" ON photos FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to reels
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active reels" ON reels;
DROP POLICY IF EXISTS "Admin full access reels" ON reels;
DROP POLICY IF EXISTS "Public read reels" ON reels;
DROP POLICY IF EXISTS "Admin all reels" ON reels;
CREATE POLICY "Public read reels" ON reels FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all reels" ON reels FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active banners" ON banners;
DROP POLICY IF EXISTS "Admin full access banners" ON banners;
DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admin all banners" ON banners;
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (status = 'active');
CREATE POLICY "Admin all banners" ON banners FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings" ON settings;
DROP POLICY IF EXISTS "Admin full access settings" ON settings;
DROP POLICY IF EXISTS "Admin all settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin all settings" ON settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Apply to Storage Objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT 
WITH CHECK ( is_admin() AND bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE 
USING ( is_admin() AND bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
USING ( is_admin() AND bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );
