-- Baby's Bazaar: Storage Buckets & RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Create the required buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('categories', 'categories', true),
  ('photos', 'photos', true),
  ('reels', 'reels', true),
  ('banners', 'banners', true),
  ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup RLS for storage.objects
-- This allows anyone to read the files, but only logged-in users can upload/edit/delete.

-- Public Read Access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

-- Authenticated Insert Access
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

-- Authenticated Update Access
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );

-- Authenticated Delete Access
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING ( bucket_id IN ('products', 'categories', 'photos', 'reels', 'banners', 'settings') );
