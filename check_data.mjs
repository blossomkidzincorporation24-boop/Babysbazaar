import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_SERVICE_ROLE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  console.log('--- STAGE 0: SAFETY CHECK ---');
  
  // 1. Categories
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) console.error('Category error:', catError);
  console.log(`\nCategories count: ${categories?.length || 0}`);
  
  // 2. Products & Images
  const { data: products, error: prodError } = await supabase.from('products').select('*');
  if (prodError) console.error('Product error:', prodError);
  console.log(`Products count: ${products?.length || 0}`);
  
  let totalImages = 0;
  if (products) {
    products.forEach(p => {
      if (p.product_images && Array.isArray(p.product_images)) {
        totalImages += p.product_images.length;
      }
    });
  }
  console.log(`Total existing product images inside arrays: ${totalImages}`);
  
  // 3. Other tables
  const { count: photoCount } = await supabase.from('photos').select('*', { count: 'exact', head: true });
  console.log(`Photos count: ${photoCount || 0}`);
  
  const { count: reelCount } = await supabase.from('reels').select('*', { count: 'exact', head: true });
  console.log(`Reels count: ${reelCount || 0}`);
  
  const { count: bannerCount } = await supabase.from('banners').select('*', { count: 'exact', head: true });
  console.log(`Banners count: ${bannerCount || 0}`);
  
  const { count: settingCount } = await supabase.from('settings').select('*', { count: 'exact', head: true });
  console.log(`Settings rows count: ${settingCount || 0}`);
  
  // 4. Users
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) console.error('User error:', userError);
  console.log(`Auth users count: ${users?.length || 0}`);
  if (users?.length > 0) {
    console.log(`First user ID (potential admin): ${users[0].id}`);
  }
}

checkData();
