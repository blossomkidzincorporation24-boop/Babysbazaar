const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, '');
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBabyFeeding() {
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", "baby-feeding")
    .eq("status", "active")
    .maybeSingle();

  console.log("Baby Feeding category:", category);

  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, price, product_images, status, categories(name, slug)")
    .eq("category_id", category.id)
    .eq("status", "active");

  console.log(`Found ${products?.length} products under Baby Feeding:`);
  console.log(products);
}

checkBabyFeeding();
