// Applies scripts/variants.json (made by product-variants.mjs) to src/data/catalog.json
// and to the live Supabase products table: images[] and colours[] in matching order.
// Usage: node scripts/apply-variants.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import WS from "ws";

const variants = JSON.parse(readFileSync(new URL("./variants.json", import.meta.url), "utf8"));
const extra = {
  // the cognac photo is a woven everyday shoulder bag — name and file it accordingly
  "cognac-everyday-purse": {
    name: "Cognac Woven Everyday Bag",
    category_slug: "handbags",
    description: "Hand-woven cognac leather with a gold chain strap. Roomy, soft and polished — an everyday bag that dresses up for evenings.",
  },
};

const catPath = new URL("../src/data/catalog.json", import.meta.url);
const cat = JSON.parse(readFileSync(catPath, "utf8"));
for (const p of cat.products) {
  const v = variants[p.slug];
  if (!v) continue;
  p.images = v.images;
  p.colors = v.colors;
  Object.assign(p, extra[p.slug] ?? {});
}
writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");
console.log("catalog.json updated");

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false }, realtime: { transport: WS } });
const { data: cats } = await sb.from("categories").select("id, slug");
for (const [slug, v] of Object.entries(variants)) {
  const patch = { images: v.images, colors: v.colors, updated_at: new Date().toISOString() };
  const e = extra[slug];
  if (e) {
    patch.name = e.name;
    patch.description = e.description;
    patch.category_id = cats.find((c) => c.slug === e.category_slug)?.id;
  }
  const { data, error } = await sb.from("products").update(patch).eq("slug", slug).select("slug");
  console.log(error ? `FAIL ${slug}: ${error.message}` : `db ${slug}${data?.length ? "" : " (no row!)"}`);
}
