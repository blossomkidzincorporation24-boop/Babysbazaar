import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://pyopqnrubhfknxsmuqkc.supabase.co';
const NEW_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5b3BxbnJ1Ymhma254c211cWtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc2ODg4NSwiZXhwIjoyMTA2MzQ0ODg1fQ.cMtB1uoy5NpeiSuRwAnxm4ChcUxi_b0SZj2joafN4hQ';

const OLD_R2_PUBLIC = 'https://pub-6b5fe11c332549b48587be24c3d0b7b2.r2.dev';
const NEW_R2_PUBLIC = 'https://pub-ba17cde8ab794e6492c23c76c20220e5.r2.dev';

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

function cleanUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith(OLD_R2_PUBLIC)) {
    return url.replace(OLD_R2_PUBLIC, NEW_R2_PUBLIC);
  }
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const parts = url.split('supabase.co/storage/v1/object/public/');
    return `${NEW_R2_PUBLIC}/${parts[1]}`;
  }
  return url;
}

async function run() {
  console.log('--- UPDATING ALL DATABASE IMAGE URLS TO CLIENT R2 ---');

  // 1. Update Products
  const { data: products } = await supabase.from('products').select('id, product_images');
  if (products) {
    for (const p of products) {
      if (p.product_images && p.product_images.length > 0) {
        const updated = p.product_images.map(img => cleanUrl(img));
        await supabase.from('products').update({ product_images: updated }).eq('id', p.id);
      }
    }
    console.log(`✓ Updated ${products.length} products`);
  }

  // 2. Update Product Images table
  const { data: pImages } = await supabase.from('product_images').select('id, image_url');
  if (pImages) {
    for (const pi of pImages) {
      const updatedUrl = cleanUrl(pi.image_url);
      await supabase.from('product_images').update({ image_url: updatedUrl }).eq('id', pi.id);
    }
    console.log(`✓ Updated ${pImages.length} product_images rows`);
  }

  // 3. Update Banners
  const { data: banners } = await supabase.from('banners').select('id, image, mobile_image');
  if (banners) {
    for (const b of banners) {
      const updatedImg = cleanUrl(b.image);
      const updatedMobile = cleanUrl(b.mobile_image);
      await supabase.from('banners').update({ image: updatedImg, mobile_image: updatedMobile }).eq('id', b.id);
    }
    console.log(`✓ Updated ${banners.length} banners`);
  }

  // 4. Update Offer Banners
  const { data: offerBanners } = await supabase.from('offer_banners').select('id, image, mobile_image');
  if (offerBanners) {
    for (const ob of offerBanners) {
      const updatedImg = cleanUrl(ob.image);
      const updatedMobile = cleanUrl(ob.mobile_image);
      await supabase.from('offer_banners').update({ image: updatedImg, mobile_image: updatedMobile }).eq('id', ob.id);
    }
    console.log(`✓ Updated ${offerBanners.length} offer_banners`);
  }

  // 5. Update Reels
  const { data: reels } = await supabase.from('reels').select('id, video, thumbnail');
  if (reels) {
    for (const r of reels) {
      const updatedVideo = cleanUrl(r.video);
      const updatedThumb = cleanUrl(r.thumbnail);
      await supabase.from('reels').update({ video: updatedVideo, thumbnail: updatedThumb }).eq('id', r.id);
    }
    console.log(`✓ Updated ${reels.length} reels`);
  }

  // 6. Update Photos
  const { data: photos } = await supabase.from('photos').select('id, image');
  if (photos) {
    for (const ph of photos) {
      const updatedImg = cleanUrl(ph.image);
      await supabase.from('photos').update({ image: updatedImg }).eq('id', ph.id);
    }
    console.log(`✓ Updated ${photos.length} photos`);
  }

  console.log('\n🎉 ALL DATABASE REFERENCES ARE NOW USING THE CLIENT R2 CDN!');
}

run();
