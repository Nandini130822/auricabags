// Adds (or removes) sample orders, payments, shipments and reviews in the LIVE Supabase
// database so the admin dashboard has something to show in a client demo.
// Everything it creates is tagged: orders have notes = 'DEMO', reviews are listed in
// scripts/demo-data-ids.json.
//
//   node scripts/demo-data.mjs add      → insert sample data
//   node scripts/demo-data.mjs remove   → delete all of it again
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import WS from "ws";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/).map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WS },
});
const idsFile = new URL("./demo-data-ids.json", import.meta.url);
const mode = process.argv[2];

const ago = (days, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();
const must = (r, what) => { if (r.error) throw new Error(`${what}: ${r.error.message}`); return r.data; };

if (mode === "remove") {
  const orders = must(await sb.from("orders").delete().eq("notes", "DEMO").select("id"), "delete orders");
  let reviews = 0;
  if (existsSync(idsFile)) {
    const ids = JSON.parse(readFileSync(idsFile, "utf8")).reviews ?? [];
    if (ids.length) reviews = must(await sb.from("reviews").delete().in("id", ids).select("id"), "delete reviews").length;
    writeFileSync(idsFile, JSON.stringify({ reviews: [] }, null, 2));
  }
  console.log(`Removed ${orders.length} demo orders (with their items, payments, shipments) and ${reviews} demo reviews.`);
  process.exit(0);
}
if (mode !== "add") {
  console.log("Usage: node scripts/demo-data.mjs add | remove");
  process.exit(1);
}

const existing = must(await sb.from("orders").select("id").eq("notes", "DEMO"), "check");
if (existing.length) {
  console.log(`Demo data already present (${existing.length} orders). Run "remove" first to reset.`);
  process.exit(0);
}

const products = must(await sb.from("products").select("id, slug, name, price, images, colors").eq("is_active", true), "products");
const P = (slug) => products.find((p) => p.slug === slug) ?? products[0];

const people = [
  ["Riya Mehta", "riya.mehta@example.com", "+91 98250 11223", "Surat", "Gujarat", "395007", "12, Rose Villa, Ghod Dod Road"],
  ["Ananya Shah", "ananya.shah@example.com", "+91 98790 44521", "Ahmedabad", "Gujarat", "380015", "B-402, Shanti Kunj, Satellite"],
  ["Priya Kapoor", "priya.k@example.com", "+91 98200 77310", "Mumbai", "Maharashtra", "400050", "7, Sea Breeze Apts, Bandra West"],
  ["Sneha Patel", "sneha.patel@example.com", "+91 99250 66102", "Vadodara", "Gujarat", "390007", "21, Gulmohar Park, Alkapuri"],
  ["Kavya Iyer", "kavya.iyer@example.com", "+91 98450 33291", "Bengaluru", "Karnataka", "560038", "88, 12th Main, Indiranagar"],
  ["Meera Joshi", "meera.joshi@example.com", "+91 98220 55617", "Pune", "Maharashtra", "411001", "3, Kalyani Nagar"],
  ["Ishita Desai", "ishita.d@example.com", "+91 98290 41188", "Jaipur", "Rajasthan", "302001", "14, C-Scheme"],
  ["Aarohi Singh", "aarohi.singh@example.com", "+91 98110 90243", "New Delhi", "Delhi", "110024", "45, Lajpat Nagar II"],
];

// [person, [product slugs], status, method, days ago]
const plan = [
  [0, ["noor-crystal-clutch", "zari-heritage-potli"], "delivered", "upi", 13],
  [1, ["rouge-top-handle-bag"], "delivered", "card", 11],
  [2, ["ivory-quilted-flap-bag", "pearl-white-wristlet"], "delivered", "upi", 9],
  [3, ["mehfil-beaded-potli", "mehfil-beaded-potli"], "shipped", "cod", 6],
  [4, ["blush-marble-mini"], "shipped", "card", 5],
  [5, ["gulabi-satin-box-clutch"], "out_for_delivery", "upi", 3],
  [6, ["metallic-chain-sling", "noor-crystal-clutch"], "packed", "netbanking", 2],
  [7, ["onyx-shoulder-bag"], "confirmed", "upi", 1],
  [0, ["saffron-mini-tote"], "confirmed", "cod", 0],
  [2, ["midnight-envelope-clutch"], "pending", "upi", 0],
];
const couriers = ["Delhivery", "Blue Dart", "Xpressbees", "DTDC"];
const shipStatus = { shipped: "in_transit", out_for_delivery: "out_for_delivery", delivered: "delivered" };
const steps = [
  ["created", "Shipment created", "Surat, GJ"],
  ["picked_up", "Picked up from Aurica studio", "Surat, GJ"],
  ["in_transit", "In transit", "Hub — Ahmedabad, GJ"],
  ["out_for_delivery", "Out for delivery", null],
  ["delivered", "Delivered", null],
];

let created = 0;
for (const [i, [pi, slugs, status, method, days]] of plan.entries()) {
  const [name, email, phone, city, state, pincode, line1] = people[pi];
  const items = slugs.reduce((acc, s) => {
    const p = P(s);
    const hit = acc.find((x) => x.product_id === p.id);
    if (hit) hit.quantity++;
    else acc.push({ product_id: p.id, name: p.name, image: p.images[0] ?? null, color: p.colors[0] ?? null, price: Number(p.price), quantity: 1 });
    return acc;
  }, []);
  const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const coupon = i % 3 === 0 ? "AURICA10" : null;
  const discount = coupon ? Math.min(500, Math.round(subtotal * 0.1)) : 0;
  const shipping = (subtotal - discount >= 1999 ? 0 : 99) + (method === "cod" ? 49 : 0);
  const total = subtotal - discount + shipping;
  const paid = method === "cod" ? status === "delivered" : status !== "pending";
  const createdAt = ago(days, 2 + i);

  const order = must(
    await sb.from("orders").insert({
      email, customer_name: name, phone,
      shipping_address: { full_name: name, phone, line1, line2: "", city, state, pincode },
      subtotal, discount, shipping_fee: shipping, total, coupon_code: coupon,
      status, payment_status: paid ? "paid" : "pending", payment_method: method,
      notes: "DEMO", created_at: createdAt, updated_at: createdAt,
    }).select("id, order_number").single(),
    "insert order",
  );
  must(await sb.from("order_items").insert(items.map((x) => ({ ...x, order_id: order.id }))), "insert items");

  if (method !== "cod" && status !== "pending") {
    must(await sb.from("payments").insert({
      order_id: order.id, provider: "razorpay_demo", provider_payment_id: "pay_demo" + (1e9 + i * 7919).toString(36),
      method, amount: total, status: "captured", created_at: createdAt,
    }), "insert payment");
  }
  if (method === "cod" && status === "delivered") {
    must(await sb.from("payments").insert({ order_id: order.id, provider: "cod", method: "cod", amount: total, status: "captured", created_at: ago(days - 3) }), "insert cod payment");
  }

  const ss = shipStatus[status];
  if (ss) {
    const courier = couriers[i % couriers.length];
    const upto = steps.findIndex((s) => s[0] === ss);
    const t0 = new Date(createdAt).getTime() + 6 * 36e5;
    const events = steps.slice(0, upto + 1).map((s, k) => ({
      status: s[0], label: s[1], location: s[2] ?? `${city}, ${state}`, at: new Date(t0 + k * 20 * 36e5).toISOString(),
    }));
    must(await sb.from("shipments").insert({
      order_id: order.id, courier, awb: `${courier.slice(0, 2).toUpperCase()}${7400000000 + i * 104729}`,
      status: ss, events, eta: new Date(new Date(createdAt).getTime() + 5 * 864e5).toISOString().slice(0, 10),
      created_at: new Date(t0).toISOString(),
    }), "insert shipment");
  }
  created++;
  console.log(`  ${order.order_number}  ${name.padEnd(13)} ${status.padEnd(17)} ₹${total}`);
}

const reviewSeed = [
  ["noor-crystal-clutch", "Riya M.", 5, "Stole the show at my reception", "The crystals sparkle beautifully under lights. Got so many compliments!", "approved"],
  ["zari-heritage-potli", "Sneha P.", 5, "Perfect for mehendi", "Lovely embroidery and very roomy. Looks far more expensive than it is.", "approved"],
  ["rouge-top-handle-bag", "Ananya S.", 4, "Gorgeous colour", "The red is rich and the structure holds well. Strap could be a little longer.", "approved"],
  ["ivory-quilted-flap-bag", "Priya K.", 5, "Quiet luxury", "Exactly like the photos — soft ivory and so elegant.", "approved"],
  ["blush-marble-mini", "Kavya I.", 4, "Cute and sturdy", "Fits my phone and lipstick. Love the finish.", "approved"],
  ["pearl-white-wristlet", "Meera J.", 5, "Bought three for my bridesmaids", "Everyone loved them. Will order again for wholesale.", "approved"],
  ["metallic-chain-sling", "Ishita D.", 5, "Dance-floor ready", "Lightweight and goes with everything.", "pending"],
  ["gulabi-satin-box-clutch", "Aarohi S.", 3, "Nice but small", "Beautiful clutch, though a bit smaller than I expected.", "pending"],
];
const reviews = must(
  await sb.from("reviews").insert(reviewSeed.map(([slug, author_name, rating, title, body, status], k) => ({
    product_id: P(slug).id, author_name, rating, title, body, status, created_at: ago(12 - k),
  }))).select("id"),
  "insert reviews",
);
writeFileSync(idsFile, JSON.stringify({ reviews: reviews.map((r) => r.id) }, null, 2));
console.log(`Added ${created} demo orders and ${reviews.length} reviews (6 approved, 2 waiting for approval).`);
