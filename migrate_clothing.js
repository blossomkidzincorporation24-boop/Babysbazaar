// Run clothing tables migration via Supabase REST API
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

async function query(table, method, body, qs) {
  let endpoint = `${url}/rest/v1/${table}`;
  if (qs) endpoint += `?${qs}`;
  const res = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text, status: res.status };
  }
  if (method === 'GET' || (method === 'POST' && res.headers.get('content-type')?.includes('json'))) {
    return { data: await res.json(), status: res.status };
  }
  return { status: res.status };
}

async function runSQL(sql) {
  const res = await fetch(`${url}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

async function main() {
  console.log('🔧 Creating clothing management tables...\n');

  // Try to create tables via SQL using the pg endpoint
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS clothing_subcategories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS clothing_age_groups (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS clothing_sizes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
    `ALTER TABLE clothing_subcategories ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE clothing_age_groups ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE clothing_sizes ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_subcategories' AND policyname = 'Public read clothing_subcategories') THEN
        CREATE POLICY "Public read clothing_subcategories" ON clothing_subcategories FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_subcategories' AND policyname = 'Auth manage clothing_subcategories') THEN
        CREATE POLICY "Auth manage clothing_subcategories" ON clothing_subcategories FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_age_groups' AND policyname = 'Public read clothing_age_groups') THEN
        CREATE POLICY "Public read clothing_age_groups" ON clothing_age_groups FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_age_groups' AND policyname = 'Auth manage clothing_age_groups') THEN
        CREATE POLICY "Auth manage clothing_age_groups" ON clothing_age_groups FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_sizes' AND policyname = 'Public read clothing_sizes') THEN
        CREATE POLICY "Public read clothing_sizes" ON clothing_sizes FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_sizes' AND policyname = 'Auth manage clothing_sizes') THEN
        CREATE POLICY "Auth manage clothing_sizes" ON clothing_sizes FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$`,
  ];

  for (const sql of sqlStatements) {
    try {
      const res = await fetch(`${url}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      if (res.ok) {
        console.log(`✅ SQL executed successfully`);
      } else {
        // Try alternate endpoint
        const res2 = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({ query: sql }),
        });
        if (res2.ok) console.log(`✅ SQL via RPC`);
        else console.log(`⚠️  SQL endpoint not available, will try REST seeding`);
      }
    } catch (e) {
      console.log(`⚠️  SQL failed: ${e.message}`);
    }
  }

  // Seed data via REST API (works regardless of SQL endpoint)
  console.log('\n📦 Seeding clothing data via REST...\n');

  const subcats = [
    { name: 'Boys Clothing', sort_order: 1 },
    { name: 'Girls Clothing', sort_order: 2 },
    { name: 'Baby Boy', sort_order: 3 },
    { name: 'Baby Girl', sort_order: 4 },
    { name: 'Unisex', sort_order: 5 },
  ];

  const ages = [
    { name: '0–3 Months', sort_order: 1 },
    { name: '3–6 Months', sort_order: 2 },
    { name: '6–12 Months', sort_order: 3 },
    { name: '1–2 Years', sort_order: 4 },
    { name: '2–3 Years', sort_order: 5 },
    { name: '3–5 Years', sort_order: 6 },
    { name: '5–7 Years', sort_order: 7 },
    { name: '7–10 Years', sort_order: 8 },
    { name: '10–12 Years', sort_order: 9 },
    { name: '12–14 Years', sort_order: 10 },
  ];

  const szs = [
    'Newborn', '0–3M', '3–6M', '6–12M', '1–2Y', '2–3Y', '3–4Y',
    '4–5Y', '5–6Y', '6–7Y', '7–8Y', '8–9Y', '9–10Y',
    '10–11Y', '11–12Y', '12–13Y', '13–14Y'
  ];

  for (const item of subcats) {
    const r = await query('clothing_subcategories', 'POST', item);
    console.log(`  Sub-category "${item.name}": ${r.error ? '⚠️ ' + (r.error.includes('duplicate') ? 'already exists' : r.error.substring(0,60)) : '✅'}`);
  }

  for (const item of ages) {
    const r = await query('clothing_age_groups', 'POST', item);
    console.log(`  Age Group "${item.name}": ${r.error ? '⚠️ ' + (r.error.includes('duplicate') ? 'already exists' : r.error.substring(0,60)) : '✅'}`);
  }

  for (let i = 0; i < szs.length; i++) {
    const r = await query('clothing_sizes', 'POST', { name: szs[i], sort_order: i + 1 });
    console.log(`  Size "${szs[i]}": ${r.error ? '⚠️ ' + (r.error.includes('duplicate') ? 'already exists' : r.error.substring(0,60)) : '✅'}`);
  }

  // Also ensure "Clothing" category exists
  console.log('\n👕 Ensuring "Clothing" category exists...');
  const { data: cats } = await query('categories', 'GET', null, 'name=eq.Clothing');
  if (!cats || cats.length === 0) {
    const r = await query('categories', 'POST', { name: 'Clothing', slug: 'clothing', status: 'active' });
    console.log(r.error ? '⚠️ ' + r.error.substring(0,80) : '✅ Clothing category created');
  } else {
    console.log('✅ Already exists');
  }

  console.log('\n🎉 Done!\n');
}

main().catch(console.error);
