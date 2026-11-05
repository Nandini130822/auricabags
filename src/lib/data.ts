import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { demo, hydrateOrder } from "@/lib/demo-store";
import type { Category, Order, Product, Profile, Review, StoreSettings } from "@/lib/types";

const PRODUCT_SELECT = "*, category:categories(id,name,slug)";

export type ProductFilter = {
  category?: string;
  occasion?: string;
  q?: string;
  sort?: "new" | "price-asc" | "price-desc" | "featured";
  min?: number;
  max?: number;
  featured?: boolean;
  isNew?: boolean;
  limit?: number;
};

const num = (p: Product): Product => ({
  ...p,
  price: Number(p.price),
  compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return demo().categories;
  const sb = await createClient();
  const { data } = await sb.from("categories").select("*").order("sort_order");
  return data ?? [];
});

export async function getProducts(f: ProductFilter = {}): Promise<Product[]> {
  let list: Product[];
  if (!isSupabaseConfigured) {
    list = demo().products.filter((p) => p.is_active);
  } else {
    const sb = await createClient();
    let q = sb.from("products").select(PRODUCT_SELECT).eq("is_active", true);
    if (f.featured) q = q.eq("is_featured", true);
    if (f.isNew) q = q.eq("is_new", true);
    const { data } = await q;
    list = ((data ?? []) as Product[]).map(num);
  }
  if (f.category) list = list.filter((p) => p.category?.slug === f.category);
  if (f.occasion) list = list.filter((p) => p.occasions.some((o) => o.toLowerCase() === f.occasion!.toLowerCase()));
  if (f.featured) list = list.filter((p) => p.is_featured);
  if (f.isNew) list = list.filter((p) => p.is_new);
  if (f.min) list = list.filter((p) => p.price >= f.min!);
  if (f.max) list = list.filter((p) => p.price <= f.max!);
  if (f.q) {
    const s = f.q.toLowerCase();
    list = list.filter((p) => [p.name, p.description, p.material, p.category?.name].join(" ").toLowerCase().includes(s));
  }
  const sorts: Record<string, (a: Product, b: Product) => number> = {
    new: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    featured: (a, b) => Number(b.is_featured) - Number(a.is_featured),
  };
  list = [...list].sort(sorts[f.sort ?? "featured"]);
  return f.limit ? list.slice(0, f.limit) : list;
}

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return demo().products.find((p) => p.slug === slug && p.is_active) ?? null;
  const sb = await createClient();
  const { data } = await sb.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data ? num(data as Product) : null;
});

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured)
    return demo().reviews.filter((r) => r.product_id === productId && r.status === "approved");
  const sb = await createClient();
  const { data } = await sb
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getLatestReviews(limit = 6): Promise<Review[]> {
  if (!isSupabaseConfigured)
    return demo().reviews.filter((r) => r.status === "approved" && r.rating >= 4).slice(0, limit);
  const sb = await createClient();
  const { data } = await sb
    .from("reviews")
    .select("*, product:products(name,slug)")
    .eq("status", "approved")
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured) return demo().settings;
  const sb = await createClient();
  const { data } = await sb.from("store_settings").select("payment,delivery").eq("id", 1).maybeSingle();
  return (data as StoreSettings) ?? demo().settings;
});

// ---------------------------------------------------------------- session

export type SessionUser = { id: string; email: string; profile: Profile | null; demo?: boolean };

/** In demo mode we pretend the visitor is a signed-in demo customer so every page is explorable. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured) {
    const p = demo().profiles.find((x) => x.id === "demo-user-0")!;
    return { id: p.id, email: p.email!, profile: p, demo: true };
  }
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email ?? "", profile };
});

export const getIsAdmin = cache(async () => {
  if (!isSupabaseConfigured) return true;
  const u = await getSessionUser();
  return u?.profile?.role === "admin";
});

// ---------------------------------------------------------------- customer area

export async function getMyOrders(): Promise<Order[]> {
  const u = await getSessionUser();
  if (!u) return [];
  if (!isSupabaseConfigured)
    return demo()
      .orders.filter((o) => o.user_id === u.id)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .map(hydrateOrder);
  const sb = await createClient();
  const { data } = await sb
    .from("orders")
    .select("*, order_items(*), shipments(*)")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as Order[];
}

export async function getMyOrder(id: string): Promise<Order | null> {
  const u = await getSessionUser();
  if (!u) return null;
  if (!isSupabaseConfigured) {
    const o = demo().orders.find((x) => x.id === id && x.user_id === u.id);
    return o ? hydrateOrder(o) : null;
  }
  const sb = await createClient();
  const { data } = await sb
    .from("orders")
    .select("*, order_items(*), payments(*), shipments(*)")
    .eq("id", id)
    .maybeSingle();
  return data as Order | null;
}

export async function getMyAddresses() {
  const u = await getSessionUser();
  if (!u) return [];
  if (!isSupabaseConfigured) {
    const o = demo().orders.find((x) => x.user_id === u.id);
    return o ? [{ ...o.shipping_address, id: "demo-addr", is_default: true }] : [];
  }
  const sb = await createClient();
  const { data } = await sb.from("addresses").select("*").eq("user_id", u.id).order("created_at");
  return data ?? [];
}

export async function getMyWishlist(): Promise<Product[]> {
  const u = await getSessionUser();
  if (!u) return [];
  if (!isSupabaseConfigured) return demo().products.filter((p) => p.is_featured).slice(0, 3);
  const sb = await createClient();
  const { data } = await sb.from("wishlist").select("product:products(" + PRODUCT_SELECT + ")").eq("user_id", u.id);
  return ((data ?? []) as unknown as { product: Product }[]).map((r) => num(r.product)).filter(Boolean);
}
