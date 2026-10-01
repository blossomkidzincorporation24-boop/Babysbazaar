const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, '');
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("Supabase Project URL:", env.NEXT_PUBLIC_SUPABASE_URL);

// Public Anon Client
const anonClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Service Role Client
const adminClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
  console.log("\n--- 1. Testing Anon (Public) Query on products ---");
  const { data: anonProducts, error: anonErr } = await anonClient
    .from("products")
    .select("id, title, slug, status, category_id, is_active:status")
    .limit(50);
  
  if (anonErr) {
    console.error("❌ Anon products query error:", anonErr);
  } else {
    console.log(`✅ Anon products query returned ${anonProducts.length} items`);
    console.log("Sample items:", anonProducts.slice(0, 5));
  }

  console.log("\n--- 2. Testing Service Role Query on products ---");
  const { data: adminProducts, error: adminErr } = await adminClient
    .from("products")
    .select("id, title, slug, status, category_id")
    .limit(50);
  
  if (adminErr) {
    console.error("❌ Service role products query error:", adminErr);
  } else {
    console.log(`✅ Service role products query returned ${adminProducts.length} items`);
  }

  console.log("\n--- 3. Checking RLS Policies on products ---");
  // Query pg_policies via postgres function or direct query if possible, or test specific actions
  const { data: policies, error: polErr } = await adminClient.rpc('get_policies_for_table', { table_name: 'products' }).catch(() => ({ data: null }));
  if (!policies) {
    console.log("Checking RLS via system tables or direct anon insert test...");
  }

  console.log("\n--- 4. Checking Anon query on categories ---");
  const { data: anonCats, error: catErr } = await anonClient
    .from("categories")
    .select("id, name, slug, status")
    .limit(50);
  if (catErr) {
    console.error("❌ Anon categories error:", catErr);
  } else {
    console.log(`✅ Anon categories query returned ${anonCats.length} items`);
  }
}

investigate();
