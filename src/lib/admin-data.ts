import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { demo, hydrateOrder } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Category, Coupon, Order, Payment, Product, Profile, Review, Shipment, StoreSettings } from "@/lib/types";

const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));

const numOrder = (o: Order): Order => ({
  ...o,
  subtotal: Number(o.subtotal),
  discount: Number(o.discount),
  shipping_fee: Number(o.shipping_fee),
  total: Number(o.total),
  order_items: o.order_items?.map((i) => ({ ...i, price: Number(i.price) })),
  payments: o.payments?.map((p) => ({ ...p, amount: Number(p.amount) })),
});
const numProduct = (p: Product): Product => ({ ...p, price: Number(p.price), compare_at_price: n(p.compare_at_price) });
const numCoupon = (c: Coupon): Coupon => ({
  ...c,
  value: Number(c.value),
  min_order: Number(c.min_order),
  max_discount: n(c.max_discount),
});

const byNewest = <T extends { created_at: string }>(a: T, b: T) => +new Date(b.created_at) - +new Date(a.created_at);

// ------------------------------------------------------------- orders

export async function adminOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return [...demo().orders].sort(byNewest).map(hydrateOrder);
  const sb = await createClient();
  const { data } = await sb.from("orders").select("*, order_items(*), payments(*), shipments(*)").order("created_at", { ascending: false });
  return ((data ?? []) as Order[]).map(numOrder);
}

export async function adminOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured) {
    const o = demo().orders.find((x) => x.id === id);
    return o ? hydrateOrder(o) : null;
  }
  const sb = await createClient();
  const { data } = await sb.from("orders").select("*, order_items(*), payments(*), shipments(*)").eq("id", id).maybeSingle();
  return data ? numOrder(data as Order) : null;
}

// ------------------------------------------------------------- catalogue

export async function adminProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [...demo().products].sort(byNewest);
  const sb = await createClient();
  const { data } = await sb.from("products").select("*, category:categories(id,name,slug)").order("created_at", { ascending: false });
  return ((data ?? []) as Product[]).map(numProduct);
}

export async function adminProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return demo().products.find((p) => p.id === id) ?? null;
  const sb = await createClient();
  const { data } = await sb.from("products").select("*").eq("id", id).maybeSingle();
  return data ? numProduct(data as Product) : null;
}

export async function adminCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [...demo().categories].sort((a, b) => a.sort_order - b.sort_order);
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return data ?? [];
}

// ------------------------------------------------------------- people & content

export type CustomerRow = Profile & { orders: number; spent: number };

export async function adminCustomers(): Promise<CustomerRow[]> {
  let profiles: Profile[];
  let orders: Pick<Order, "user_id" | "total" | "payment_status">[];
  if (!isSupabaseConfigured) {
    profiles = demo().profiles;
    orders = demo().orders;
  } else {
    const sb = await createClient();
    const [p, o] = await Promise.all([
      sb.from("profiles").select("*").order("created_at", { ascending: false }),
      sb.from("orders").select("user_id,total,payment_status"),
    ]);
    profiles = p.data ?? [];
    orders = o.data ?? [];
  }
  return profiles
    .map((p) => {
      const mine = orders.filter((o) => o.user_id === p.id);
      return {
        ...p,
        orders: mine.length,
        spent: mine.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0),
      };
    })
    .sort(byNewest);
}

export async function adminCustomer(id: string) {
  const all = await adminCustomers();
  const c = all.find((x) => x.id === id);
  if (!c) return null;
  const orders = (await adminOrders()).filter((o) => o.user_id === id);
  return { customer: c, orders };
}

export async function adminReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return [...demo().reviews].sort(byNewest);
  const sb = await createClient();
  const { data } = await sb.from("reviews").select("*, product:products(name,slug)").order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured) return [...demo().coupons].sort(byNewest);
  const sb = await createClient();
  const { data } = await sb.from("coupons").select("*").order("created_at", { ascending: false });
  return ((data ?? []) as Coupon[]).map(numCoupon);
}

export async function adminCoupon(id: string): Promise<Coupon | null> {
  return (await adminCoupons()).find((c) => c.id === id) ?? null;
}

// ------------------------------------------------------------- payments & delivery

export async function adminPayments(): Promise<Payment[]> {
  if (!isSupabaseConfigured) {
    const s = demo();
    return [...s.payments].sort(byNewest).map((p) => {
      const o = s.orders.find((x) => x.id === p.order_id);
      return { ...p, order: o ? { order_number: o.order_number, customer_name: o.customer_name } : null };
    });
  }
  const sb = await createClient();
  const { data } = await sb.from("payments").select("*, order:orders(order_number,customer_name)").order("created_at", { ascending: false });
  return ((data ?? []) as Payment[]).map((p) => ({ ...p, amount: Number(p.amount) }));
}

export async function adminShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured) {
    const s = demo();
    return [...s.shipments].sort(byNewest).map((x) => {
      const o = s.orders.find((y) => y.id === x.order_id);
      return {
        ...x,
        order: o ? { order_number: o.order_number, customer_name: o.customer_name, shipping_address: o.shipping_address } : null,
      };
    });
  }
  const sb = await createClient();
  const { data } = await sb
    .from("shipments")
    .select("*, order:orders(order_number,customer_name,shipping_address)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminSettings(): Promise<StoreSettings> {
  if (!isSupabaseConfigured) return demo().settings;
  const sb = await createClient();
  const { data } = await sb.from("store_settings").select("payment,delivery").eq("id", 1).maybeSingle();
  return (data as StoreSettings) ?? demo().settings;
}

// ------------------------------------------------------------- overview

export async function adminOverview() {
  const [orders, products, customers, reviews] = await Promise.all([
    adminOrders(),
    adminProducts(),
    adminCustomers(),
    adminReviews(),
  ]);
  const paid = orders.filter((o) => o.payment_status === "paid");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const total = orders
      .filter((o) => o.status !== "cancelled" && new Date(o.created_at).toISOString().slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0);
    return { date: d, total };
  });
  return {
    revenue,
    orderCount: orders.length,
    aov: paid.length ? Math.round(revenue / paid.length) : 0,
    customers: customers.filter((c) => c.role === "customer").length,
    pendingOrders: orders.filter((o) => ["pending", "confirmed", "packed"].includes(o.status)).length,
    lowStock: products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock),
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    recent: orders.slice(0, 6),
    days,
  };
}
