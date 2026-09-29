-- ============================================================
-- Baby's Bazaar — PART 3: ROW LEVEL SECURITY
-- Run this THIRD in Supabase SQL Editor
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC: read active records only
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active photos" ON photos FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active reels" ON reels FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (status = 'active');
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- ADMIN: full access when authenticated
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access photos" ON photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reels" ON reels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
