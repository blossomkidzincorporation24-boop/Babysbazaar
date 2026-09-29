CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  caption TEXT,
  type TEXT NOT NULL DEFAULT 'delivery' CHECK (type IN ('delivery', 'event')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

INSERT INTO settings (store_name, whatsapp_number)
VALUES ('Baby''s Bazaar', '')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_photos BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_reels BEFORE UPDATE ON reels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_banners BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active photos" ON photos FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active reels" ON reels FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (status = 'active');
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access photos" ON photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reels" ON reels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
