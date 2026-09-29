-- ==============================================================================
-- BABY'S BAZAAR — MIGRATION 003: CONTENT & BANNER MANAGEMENT SYSTEM
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. ENHANCE HERO BANNERS TABLE
ALTER TABLE banners 
  ADD COLUMN IF NOT EXISTS mobile_image TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- 2. ENHANCE REELS TABLE
ALTER TABLE reels
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- 3. CREATE OFFER BANNERS TABLE
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

-- 4. CREATE DELIVERY & TRUST FEATURES TABLE
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

-- 5. CREATE CENTRALIZED MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  bucket TEXT DEFAULT 'banners',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE offer_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- 7. PUBLIC READ POLICIES (Storefront can view active items)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active offer_banners') THEN
    CREATE POLICY "Public read active offer_banners" ON offer_banners FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active delivery_features') THEN
    CREATE POLICY "Public read active delivery_features" ON delivery_features FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read media_assets') THEN
    CREATE POLICY "Public read media_assets" ON media_assets FOR SELECT USING (true);
  END IF;
END $$;

-- 8. AUTHENTICATED ADMIN FULL ACCESS POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage offer_banners') THEN
    CREATE POLICY "Admin manage offer_banners" ON offer_banners FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage delivery_features') THEN
    CREATE POLICY "Admin manage delivery_features" ON delivery_features FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage media_assets') THEN
    CREATE POLICY "Admin manage media_assets" ON media_assets FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 9. SEED DEFAULT FIGMA PROMOTIONAL OFFER BANNER
INSERT INTO offer_banners (title, subtitle, badge_text, image, mobile_image, button_text, button_link, status, display_order)
VALUES (
  'Little Things. Big Smiles.',
  'Discover our latest baby essentials — crafted from unbleached cotton and baby-safe natural woods.',
  'FAMILY CRAFTED',
  'https://api.builder.io/api/v1/image/assets/TEMP/2d38a5e1b98fc183b888c3ae36bd53f100d255e7?width=2684',
  'https://api.builder.io/api/v1/image/assets/TEMP/2d38a5e1b98fc183b888c3ae36bd53f100d255e7?width=1200',
  'Shop Collection',
  '/categories',
  'active',
  1
) ON CONFLICT DO NOTHING;

-- 10. SEED DEFAULT DELIVERY & PERKS FEATURES
INSERT INTO delivery_features (title, description, icon, badge_type, display_order, status) VALUES
  ('Free Shipping on Orders above ₹3500', NULL, '✨', 'ribbon', 1, 'active'),
  ('Same day shipping for orders before 5 PM', NULL, '📦', 'ribbon', 2, 'active'),
  ('Shipping across INDIA', NULL, '🚚', 'ribbon', 3, 'active'),
  ('For international and wholesale orders DM us', NULL, '🌍', 'ribbon', 4, 'active'),
  ('WhatsApp Concierge', 'Instant size advice, photos & real-time care', 'MessageCircle', 'trust_badge', 1, 'active'),
  ('Pan-India Dispatch', 'Insured doorstep parcel dispatch in 24 hrs', 'Truck', 'trust_badge', 2, 'active'),
  ('Personalized Gifting', 'Handcrafted keepsake boxes & calligraphy', 'Gift', 'trust_badge', 3, 'active')
ON CONFLICT DO NOTHING;
