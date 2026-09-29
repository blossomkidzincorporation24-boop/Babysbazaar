-- Baby's Bazaar: Clothing Management Tables
-- Run this in Supabase SQL Editor

-- 1. Clothing Sub-categories
CREATE TABLE IF NOT EXISTS clothing_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clothing Age Groups
CREATE TABLE IF NOT EXISTS clothing_age_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Clothing Sizes
CREATE TABLE IF NOT EXISTS clothing_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE clothing_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_sizes ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read clothing_subcategories" ON clothing_subcategories FOR SELECT USING (true);
CREATE POLICY "Public read clothing_age_groups" ON clothing_age_groups FOR SELECT USING (true);
CREATE POLICY "Public read clothing_sizes" ON clothing_sizes FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "Auth manage clothing_subcategories" ON clothing_subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage clothing_age_groups" ON clothing_age_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage clothing_sizes" ON clothing_sizes FOR ALL USING (true) WITH CHECK (true);

-- Seed some initial data
INSERT INTO clothing_subcategories (name, sort_order) VALUES
  ('Boys Clothing', 1),
  ('Girls Clothing', 2),
  ('Baby Boy', 3),
  ('Baby Girl', 4),
  ('Unisex', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO clothing_age_groups (name, sort_order) VALUES
  ('0–3 Months', 1),
  ('3–6 Months', 2),
  ('6–12 Months', 3),
  ('1–2 Years', 4),
  ('2–3 Years', 5),
  ('3–5 Years', 6),
  ('5–7 Years', 7),
  ('7–10 Years', 8),
  ('10–12 Years', 9),
  ('12–14 Years', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO clothing_sizes (name, sort_order) VALUES
  ('Newborn', 1),
  ('0–3M', 2),
  ('3–6M', 3),
  ('6–12M', 4),
  ('1–2Y', 5),
  ('2–3Y', 6),
  ('3–4Y', 7),
  ('4–5Y', 8),
  ('5–6Y', 9),
  ('6–7Y', 10),
  ('7–8Y', 11),
  ('8–9Y', 12),
  ('9–10Y', 13),
  ('10–11Y', 14),
  ('11–12Y', 15),
  ('12–13Y', 16),
  ('13–14Y', 17)
ON CONFLICT (name) DO NOTHING;
