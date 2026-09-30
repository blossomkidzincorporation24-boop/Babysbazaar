-- ============================================================
-- Baby's Bazaar — Toy Category Hierarchy Migration
-- Run this in the Supabase SQL Editor (optional, fully backwards-compatible)
-- ============================================================

-- 1. Add self-referencing parent_id to categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- 2. Create index for fast parent-child lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- 3. Update existing Toy subcategories to point to parent Toys category
UPDATE categories
SET parent_id = (SELECT id FROM categories WHERE slug = 'toys' LIMIT 1)
WHERE slug IN (
  'baby-toys',
  'educational-toys',
  'remote-control-toys',
  'cars-and-vehicles',
  'dolls-and-pretend-play',
  'building-toys',
  'musical-toys',
  'outdoor-toys',
  'soft-toys',
  'activity-and-puzzle',
  'ride-on-toys'
);
