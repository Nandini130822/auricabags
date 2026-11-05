"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { demo, demoId, hydrateOrder } from "@/lib/demo-store";
import { getSessionUser, getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Address, Order, PaymentMethod, Product } from "@/lib/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

// ------------------------------------------------------------------ coupons

export async function validateCoupon(code: string, subtotal: number): Promise<Result<{ code: string; discount: number }>> {
  code = code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code" };
  if (!isSupabaseConfigured) {
    const c = demo().coupons.find((x) => x.code === code);
    if (!c || !c.is_active) return { ok: false, error: "This code is not valid." };
    if (c.usage_limit !== null && c.used_count >= c.usage_limit) return { ok: false, error: "This offer has been fully redeemed." };
    if (subtotal < c.min_order) return { ok: false, error: `Add items worth ₹${c.min_order - subtotal} more to use this code.` };
    let d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
    if (c.max_discount) d = Math.min(d, c.max_discount);
    return { ok: true, code: c.code, discount: Math.min(d, subtotal) };
  }
  const sb = await createClient();
  const { data, error } = await sb.rpc("validate_coupon", { p_code: code, p_subtotal: subtotal });
  if (error) return { ok: false, error: error.message };
  const row = (data as { code: string; discount: number; message: string }[])[0];
  if (!row || Number(row.discount) <= 0) return { ok: false, error: row?.message ?? "This code is not valid." };
  return { ok: true, code: row.code, discount: Number(row.discount) };
}

// ------------------------------------------------------------------ orders

export type CheckoutInput = {
  email: string;
  address: Address;
  items: { productId: string; quantity: number; color: string | null }[];
  coupon: string | null;
  method: PaymentMethod;
};

export async function createOrder(
  input: CheckoutInput,
): Promise<Result<{ orderId: string; orderNumber: string; total: number }>> {
  const a = input.address;
  if (!input.email || !a.full_name || !a.phone || !a.line1 || !a.city || !a.state || !/^\d{6}$/.test(a.pincode))
    return { ok: false, error: "Please complete your delivery details (6-digit pincode)." };
  if (!input.items.length) return { ok: false, error: "Your bag is empty." };

  const settings = await getSettings();
  const enabled: Record<PaymentMethod, boolean> = {
    upi: settings.payment.upi_enabled,
    card: settings.payment.card_enabled,
    netbanking: settings.payment.netbanking_enabled,
    cod: settings.payment.cod_enabled,
  };
  if (!enabled[input.method]) return { ok: false, error: "That payment method is currently unavailable." };

  const user = await getSessionUser();
  const ids = input.items.map((i) => i.productId);

  // Prices always come from the database, never from the browser.
  let products: Product[];
  if (!isSupabaseConfigured) products = demo().products.filter((p) => ids.includes(p.id));
  else {
    const sb = createServiceClient();
    const { data } = await sb.from("products").select("*").in("id", ids).eq("is_active", true);
    products = (data ?? []) as Product[];
  }

  const lines = [];
  for (const it of input.items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return { ok: false, error: "An item in your bag is no longer available." };
    if (p.stock < it.quantity) return { ok: false, error: `Only ${p.stock} left of ${p.name}.` };
    lines.push({ product_id: p.id, name: p.name, image: p.images[0] ?? null, color: it.color, price: Number(p.price), quantity: it.quantity });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  let discount = 0;
  let coupon: string | null = null;
  if (input.coupon) {
    const c = await validateCoupon(input.coupon, subtotal);
    if (c.ok) {
      discount = c.discount;
      coupon = c.code;
    }
  }
  const shipping_fee = subtotal - discount >= settings.delivery.free_shipping_above ? 0 : settings.delivery.flat_fee;
  const cod_fee = input.method === "cod" ? 49 : 0;
  const total = subtotal - discount + shipping_fee + cod_fee;

  const base = {
    user_id: user && !user.demo ? user.id : null,
    email: input.email,
    customer_name: a.full_name,
    phone: a.phone,
    shipping_address: a,
    subtotal,
    discount,
    shipping_fee: shipping_fee + cod_fee,
    total,
    coupon_code: coupon,
    payment_method: input.method,
  };

  if (!isSupabaseConfigured) {
    const s = demo();
    const id = demoId();
    const order: Order = {
      ...base,
      id,
      user_id: user?.id ?? null,
      order_number: `AUR${s.seq++}`,
      status: "pending",
      payment_status: "pending",
      notes: null,
      created_at: new Date().toISOString(),
    };
    s.orders.unshift(order);
    s.orderItems.push(...lines.map((l) => ({ ...l, id: demoId(), order_id: id })));
    if (input.method === "cod") await finalizeOrder(id, "cod");
    return { ok: true, orderId: id, orderNumber: order.order_number, total };
  }

  const sb = createServiceClient();
  const { data: order, error } = await sb.from("orders").insert(base).select("id, order_number").single();
  if (error || !order) return { ok: false, error: error?.message ?? "Could not place order" };
  const { error: e2 } = await sb.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (e2) return { ok: false, error: e2.message };
  if (input.method === "cod") await finalizeOrder(order.id, "cod");
  return { ok: true, orderId: order.id, orderNumber: order.order_number, total };
}

/** Marks an order confirmed, reduces stock and counts coupon usage. */
async function finalizeOrder(orderId: string, kind: "cod" | "paid") {
  if (!isSupabaseConfigured) {
    const s = demo();
    const o = s.orders.find((x) => x.id === orderId)!;
    o.status = "confirmed";
    o.payment_status = kind === "paid" ? "paid" : "pending";
    s.orderItems
      .filter((i) => i.order_id === orderId)
      .forEach((i) => {
        const p = s.products.find((x) => x.id === i.product_id);
        if (p) p.stock = Math.max(0, p.stock - i.quantity);
      });
    const c = s.coupons.find((x) => x.code === o.coupon_code);
    if (c) c.used_count++;
    return;
  }
  const sb = createServiceClient();
  const { data: o } = await sb.from("orders").select("id, coupon_code, order_items(product_id, quantity)").eq("id", orderId).single();
  if (!o) return;
  await sb
    .from("orders")
    .update({ status: "confirmed", payment_status: kind === "paid" ? "paid" : "pending", updated_at: new Date().toISOString() })
    .eq("id", orderId);
  for (const it of (o.order_items ?? []) as { product_id: string; quantity: number }[]) {
    const { data: p } = await sb.from("products").select("stock").eq("id", it.product_id).single();
    if (p) await sb.from("products").update({ stock: Math.max(0, p.stock - it.quantity) }).eq("id", it.product_id);
  }
  if (o.coupon_code) {
    const { data: c } = await sb.from("coupons").select("id, used_count").eq("code", o.coupon_code).single();
    if (c) await sb.from("coupons").update({ used_count: c.used_count + 1 }).eq("id", c.id);
  }
}

/**
 * DEMO payment gateway. In production this is replaced by Razorpay/Cashfree:
 * the gateway calls a webhook and we verify the signature before calling finalizeOrder().
 */
export async function completeDemoPayment(orderId: string, outcome: "success" | "failure"): Promise<Result<{ paymentId: string }>> {
  const paymentId = "pay_demo" + Math.random().toString(36).slice(2, 12);
  if (!isSupabaseConfigured) {
    const s = demo();
    const o = s.orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, error: "Order not found" };
    if (o.payment_status === "paid") return { ok: true, paymentId };
    s.payments.unshift({
      id: demoId(),
      order_id: orderId,
      provider: "razorpay_demo",
      provider_payment_id: paymentId,
      method: o.payment_method,
      amount: o.total,
      status: outcome === "success" ? "captured" : "failed",
      created_at: new Date().toISOString(),
    });
    if (outcome === "failure") {
      o.payment_status = "failed";
      return { ok: false, error: "Payment failed (simulated). You can try again." };
    }
    await finalizeOrder(orderId, "paid");
    return { ok: true, paymentId };
  }
  const sb = createServiceClient();
  const { data: o } = await sb.from("orders").select("id,total,payment_method,payment_status").eq("id", orderId).single();
  if (!o) return { ok: false, error: "Order not found" };
  if (o.payment_status === "paid") return { ok: true, paymentId };
  await sb.from("payments").insert({
    order_id: orderId,
    provider: "razorpay_demo",
    provider_payment_id: paymentId,
    method: o.payment_method,
    amount: o.total,
    status: outcome === "success" ? "captured" : "failed",
  });
  if (outcome === "failure") {
    await sb.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
    return { ok: false, error: "Payment failed (simulated). You can try again." };
  }
  await finalizeOrder(orderId, "paid");
  return { ok: true, paymentId };
}

/** Order lookup for the thank-you page (order id is an unguessable UUID). */
export async function getOrderForReceipt(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) {
    const o = demo().orders.find((x) => x.id === orderId);
    return o ? hydrateOrder(o) : null;
  }
  const sb = createServiceClient();
  const { data } = await sb.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle();
  return data as Order | null;
}

// ------------------------------------------------------------------ reviews & wishlist

export async function submitReview(
  productId: string,
  rating: number,
  title: string,
  body: string,
): Promise<Result> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Please sign in to write a review." };
  if (rating < 1 || rating > 5) return { ok: false, error: "Choose a rating." };
  const author = user.profile?.full_name || user.email.split("@")[0];
  if (!isSupabaseConfigured) {
    const s = demo();
    const p = s.products.find((x) => x.id === productId);
    s.reviews.unshift({
      id: demoId(),
      product_id: productId,
      user_id: user.id,
      author_name: author,
      rating,
      title,
      body,
      status: "pending",
      created_at: new Date().toISOString(),
      product: p ? { name: p.name, slug: p.slug } : null,
    });
    return { ok: true };
  }
  const sb = await createClient();
  const { error } = await sb
    .from("reviews")
    .insert({ product_id: productId, user_id: user.id, author_name: author, rating, title, body, status: "pending" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function toggleWishlist(productId: string): Promise<Result<{ saved: boolean }>> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in to save favourites." };
  if (!isSupabaseConfigured) return { ok: true, saved: true };
  const sb = await createClient();
  const { data } = await sb.from("wishlist").select("product_id").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
  if (data) {
    await sb.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
    revalidatePath("/account/wishlist");
    return { ok: true, saved: false };
  }
  await sb.from("wishlist").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/account/wishlist");
  return { ok: true, saved: true };
}

// ------------------------------------------------------------------ account

export async function updateProfile(form: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !isSupabaseConfigured) return;
  const sb = await createClient();
  await sb
    .from("profiles")
    .update({ full_name: String(form.get("full_name") ?? ""), phone: String(form.get("phone") ?? "") })
    .eq("id", user.id);
  revalidatePath("/account", "layout");
}

export async function saveAddress(form: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !isSupabaseConfigured) return;
  const sb = await createClient();
  const row = {
    user_id: user.id,
    full_name: String(form.get("full_name")),
    phone: String(form.get("phone")),
    line1: String(form.get("line1")),
    line2: String(form.get("line2") ?? ""),
    city: String(form.get("city")),
    state: String(form.get("state")),
    pincode: String(form.get("pincode")),
  };
  await sb.from("addresses").insert(row);
  revalidatePath("/account/addresses");
}

export async function deleteAddress(id: string): Promise<void> {
  const user = await getSessionUser();
  if (!user || !isSupabaseConfigured) return;
  const sb = await createClient();
  await sb.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  redirect("/");
}
