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

async function checkLatest() {
  const { data: prods } = await supabase
    .from("products")
    .select("id, title, slug, price, category_id, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(10);
  
  console.log("Latest 10 products in DB:");
  console.log(prods);

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  
  console.log("\nLatest 10 activity logs:");
  console.log(logs);
}

checkLatest();
