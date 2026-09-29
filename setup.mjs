// Baby's Bazaar — Automated Database Setup
// This script runs SQL against your Supabase project

const SUPABASE_URL = 'https://tlxnoookluearhfnnkqv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseG5vb29rbHVlYXJoZm5ua3F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQyNDUzMSwiZXhwIjoyMTA2MDAwNTMxfQ.12V4BiZgfEgHTN4y33jlSWkMWnNwmHKGJ8OwayauD3o';

async function runSQL(label, sql) {
  console.log(`\n⏳ Running: ${label}...`);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (res.ok) {
      console.log(`✅ ${label} — OK`);
      return true;
    }
    const text = await res.text();
    console.log(`⚠️  ${label} — Status ${res.status}: ${text}`);
    return false;
  } catch (err) {
    console.log(`❌ ${label} — Error: ${err.message}`);
    return false;
  }
}

async function runSQLDirect(label, sql) {
  console.log(`\n⏳ Running: ${label}...`);
  try {
    // Try the pg-meta query endpoint (used by Supabase Dashboard SQL Editor)
    const res = await fetch(`${SUPABASE_URL}/pg-meta/default/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    if (res.ok) {
      console.log(`✅ ${label} — OK`);
      return true;
    }
    console.log(`⚠️  ${label} — Status ${res.status}: ${text.substring(0, 200)}`);
    return false;
  } catch (err) {
    console.log(`❌ ${label} — Error: ${err.message}`);
    return false;
  }
}

// ---- SQL Statements (broken into individual statements) ----

const SQL_EXTENSION = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

const SQL_CATEGORIES = `
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_PRODUCTS = `
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
);`;

const SQL_PHOTOS = `
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image TEXT NOT NULL,
  caption TEXT,
  type TEXT NOT NULL DEFAULT 'delivery' CHECK (type IN ('delivery', 'event')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_REELS = `
CREATE TABLE IF NOT EXISTS reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_BANNERS = `
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
);`;

const SQL_SETTINGS = `
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT,
  logo TEXT,
  whatsapp_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_DEFAULT_SETTINGS = `INSERT INTO settings (store_name, whatsapp_number) VALUES ('Baby''s Bazaar', '') ON CONFLICT DO NOTHING;`;

const SQL_TRIGGER_FN = `
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

const SQL_TRIGGERS = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_categories') THEN
    CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_products') THEN
    CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_photos') THEN
    CREATE TRIGGER set_updated_at_photos BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_reels') THEN
    CREATE TRIGGER set_updated_at_reels BEFORE UPDATE ON reels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_banners') THEN
    CREATE TRIGGER set_updated_at_banners BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_settings') THEN
    CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;`;

const SQL_RLS = `
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
`;

const SQL_POLICIES = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active categories') THEN
    CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active products') THEN
    CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active photos') THEN
    CREATE POLICY "Public read active photos" ON photos FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active reels') THEN
    CREATE POLICY "Public read active reels" ON reels FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active banners') THEN
    CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read settings') THEN
    CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access categories') THEN
    CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access products') THEN
    CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access photos') THEN
    CREATE POLICY "Admin full access photos" ON photos FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access reels') THEN
    CREATE POLICY "Admin full access reels" ON reels FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access banners') THEN
    CREATE POLICY "Admin full access banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access settings') THEN
    CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;`;

async function main() {
  console.log('🔧 Baby\'s Bazaar — Database Setup');
  console.log('==================================\n');

const SQL_CLOTHING_SUBCATEGORIES = `
CREATE TABLE IF NOT EXISTS clothing_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_CLOTHING_AGE_GROUPS = `
CREATE TABLE IF NOT EXISTS clothing_age_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_CLOTHING_SIZES = `
CREATE TABLE IF NOT EXISTS clothing_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

const SQL_CLOTHING_RLS = `
ALTER TABLE clothing_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_sizes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clothing_subcategories' AND policyname='allow_all_clothing_subcategories') THEN
    CREATE POLICY allow_all_clothing_subcategories ON clothing_subcategories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clothing_age_groups' AND policyname='allow_all_clothing_age_groups') THEN
    CREATE POLICY allow_all_clothing_age_groups ON clothing_age_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clothing_sizes' AND policyname='allow_all_clothing_sizes') THEN
    CREATE POLICY allow_all_clothing_sizes ON clothing_sizes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;`;

const SQL_CLOTHING_SEED = `
INSERT INTO clothing_subcategories (name, sort_order) VALUES
  ('Boys Clothing', 1), ('Girls Clothing', 2), ('Baby Boy', 3), ('Baby Girl', 4), ('Unisex', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO clothing_age_groups (name, sort_order) VALUES
  ('0–3 Months', 1), ('3–6 Months', 2), ('6–12 Months', 3), ('1–2 Years', 4), ('2–3 Years', 5),
  ('3–5 Years', 6), ('5–7 Years', 7), ('7–10 Years', 8), ('10–12 Years', 9), ('12–14 Years', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO clothing_sizes (name, sort_order) VALUES
  ('Newborn', 1), ('0–3M', 2), ('3–6M', 3), ('6–12M', 4), ('1–2Y', 5), ('2–3Y', 6), ('3–4Y', 7),
  ('4–5Y', 8), ('5–6Y', 9), ('6–7Y', 10), ('7–8Y', 11), ('8–9Y', 12), ('9–10Y', 13),
  ('10–11Y', 14), ('11–12Y', 15), ('12–13Y', 16), ('13–14Y', 17)
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, slug, status) VALUES ('Clothing', 'clothing', 'active')
ON CONFLICT (name) DO NOTHING;
`;

  const queries = [
    ['UUID Extension', SQL_EXTENSION],
    ['Categories table', SQL_CATEGORIES],
    ['Products table', SQL_PRODUCTS],
    ['Photos table', SQL_PHOTOS],
    ['Reels table', SQL_REELS],
    ['Banners table', SQL_BANNERS],
    ['Settings table', SQL_SETTINGS],
    ['Default settings row', SQL_DEFAULT_SETTINGS],
    ['Updated_at trigger function', SQL_TRIGGER_FN],
    ['All triggers', SQL_TRIGGERS],
    ['Enable RLS', SQL_RLS],
    ['RLS Policies', SQL_POLICIES],
    ['Clothing sub-categories table', SQL_CLOTHING_SUBCATEGORIES],
    ['Clothing age groups table', SQL_CLOTHING_AGE_GROUPS],
    ['Clothing sizes table', SQL_CLOTHING_SIZES],
    ['Clothing RLS', SQL_CLOTHING_RLS],
    ['Clothing seed data', SQL_CLOTHING_SEED],
  ];

  let allOk = true;
  for (const [label, sql] of queries) {
    const ok = await runSQLDirect(label, sql);
    if (!ok) allOk = false;
  }

  if (allOk) {
    console.log('\n🎉 All done! Database is ready.');
  } else {
    console.log('\n⚠️  Some queries had issues. See above for details.');
  }
}

main();
