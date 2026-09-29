// Seed initial data into Supabase so dashboard has real data matching the reference
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

async function query(table, method, body, match) {
  let endpoint = `${url}/rest/v1/${table}`;
  if (match) endpoint += `?${match}`;
  const res = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function seed() {
  console.log('Seeding categories...');
  const categoriesData = [
    { name: 'Baby Clothing', slug: 'baby-clothing', status: 'active', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&q=80' },
    { name: 'Blankets & Swaddles', slug: 'blankets-swaddles', status: 'active', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=300&q=80' },
    { name: 'Toys & Teethers', slug: 'toys-teethers', status: 'active', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&q=80' },
    { name: 'Footwear', slug: 'footwear', status: 'active', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&q=80' },
    { name: 'Nursery Decor', slug: 'nursery-decor', status: 'active', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80' },
    { name: 'Feeding Essentials', slug: 'feeding-essentials', status: 'active', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=300&q=80' },
    { name: 'Bath & Care', slug: 'bath-care', status: 'active', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80' },
    { name: 'Gift Sets', slug: 'gift-sets', status: 'active', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&q=80' }
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const { data } = await query('categories', 'POST', cat);
    if (data && data[0]) {
      catMap[cat.name] = data[0].id;
    }
  }

  // Fetch all categories to get IDs
  const { data: allCats } = await query('categories', 'GET');
  if (Array.isArray(allCats)) {
    allCats.forEach(c => { catMap[c.name] = c.id; });
  }

  console.log('Seeding products...');
  const productsData = [
    {
      title: 'Honey Ribbed Cotton Romper',
      description: 'Soft everyday organic cotton baby romper with easy snap buttons. Featured in Spring Newborn Drop.',
      price: 499,
      category_id: catMap['Baby Clothing'] || null,
      product_images: ['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&q=80'],
      best_seller: true,
      new_arrival: true,
      featured: true,
      status: 'active'
    },
    {
      title: 'Heirloom Cable Knit Blanket',
      description: 'Pure organic cotton cable knit baby blanket for crib and stroller. Top Gifting Item.',
      price: 899,
      category_id: catMap['Blankets & Swaddles'] || null,
      product_images: ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=500&q=80'],
      best_seller: true,
      new_arrival: false,
      featured: true,
      status: 'active'
    },
    {
      title: 'Silicone & Beechwood Teether',
      description: 'BPA Free & Certified Non-Toxic natural wood soothing teether ring.',
      price: 349,
      category_id: catMap['Toys & Teethers'] || null,
      product_images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80'],
      best_seller: false,
      new_arrival: true,
      featured: false,
      status: 'active'
    },
    {
      title: 'Soft-Sole Shearling Booties',
      description: 'Ultra-soft warm newborn booties crafted for sensitive baby feet. Scheduled for Autumn Preview.',
      price: 699,
      category_id: catMap['Footwear'] || null,
      product_images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80'],
      best_seller: false,
      new_arrival: true,
      featured: false,
      status: 'active'
    },
    {
      title: 'Boho Macrame Rainbow Wall Hanging',
      description: 'Handcrafted nursery wall hanging with natural cotton yarn. Handcrafted Nursery Decor.',
      price: 799,
      category_id: catMap['Nursery Decor'] || null,
      product_images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80'],
      best_seller: true,
      new_arrival: false,
      featured: true,
      status: 'active'
    }
  ];

  for (const prod of productsData) {
    await query('products', 'POST', prod);
  }

  console.log('Seeding banner...');
  const bannerData = {
    heading: 'Gentle Threads for Tender Skin',
    button_text: 'Explore Spring Collection',
    link: '/categories',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80',
    display_order: 1,
    status: 'active'
  };
  await query('banners', 'POST', bannerData);

  console.log('Seeding delivery photos...');
  const photosData = [
    {
      image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&q=80',
      caption: 'Aarav\'s 1st Gift Box delivered to Bangalore',
      type: 'delivery',
      status: 'active'
    },
    {
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
      caption: 'Organic Cotton Bath Towel delivery in Mumbai',
      type: 'delivery',
      status: 'active'
    },
    {
      image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80',
      caption: 'Twin newborn welcome set delivered in Chennai',
      type: 'delivery',
      status: 'active'
    }
  ];
  for (const p of photosData) {
    await query('photos', 'POST', p);
  }

  console.log('Done seeding real Supabase data!');
}

seed().catch(console.error);
