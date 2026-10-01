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
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategoriesAndProducts() {
  const { data: cats } = await supabase.from("categories").select("*");
  console.log("=== DB CATEGORIES ===");
  cats.forEach(c => console.log(`ID: ${c.id} | Name: "${c.name}" | Slug: "${c.slug}" | Status: ${c.status}`));

  const { data: prods } = await supabase.from("products").select("id, title, slug, status, category_id");
  console.log("\n=== DB PRODUCTS & THEIR CATEGORIES ===");
  prods.forEach(p => {
    const matchingCat = cats.find(c => c.id === p.category_id);
    console.log(`Product: "${p.title}" | Status: ${p.status} | CatID: ${p.category_id} -> Matched: "${matchingCat?.name}" (${matchingCat?.slug})`);
  });
}

checkCategoriesAndProducts();
