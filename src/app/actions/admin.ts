"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { COURIERS, demo, demoId, shipmentEvents } from "@/lib/demo-store";
import { getIsAdmin } from "@/lib/data";
import { slugify } from "@/lib/format";
import { SHIP_FLOW, SHIP_LABEL } from "@/lib/shipping";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, Review, Shipment, ShipmentEvent, StoreSettings } from "@/lib/types";

async function guard() {
  if (!(await getIsAdmin())) throw new Error("Not authorised");
}
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const numOrNull = (v: string) => (v === "" ? null : Number(v));
const now = () => new Date().toISOString();

function done(...paths: string[]) {
  revalidatePath("/admin", "layout");
  paths.forEach((p) => revalidatePath(p));
}

// ================================================================ orders

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await guard();
  if (!isSupabaseConfigured) {
    const o = demo().orders.find((x) => x.id === orderId);
    if (o) o.status = status;
  } else {
    const sb = await createClient();
    await sb.from("orders").update({ status, updated_at: now() }).eq("id", orderId);
  }
  done(`/admin/orders/${orderId}`);
}

export async function markCodPaid(orderId: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    const o = st.orders.find((x) => x.id === orderId);
    if (!o) return;
    o.payment_status = "paid";
    st.payments.unshift({
      id: demoId(),
      order_id: orderId,
      provider: "cod",
      provider_payment_id: "cod_" + o.order_number,
      method: "cod",
      amount: o.total,
      status: "captured",
      created_at: now(),
    });
  } else {
    const sb = await createClient();
    const { data: o } = await sb.from("orders").select("total,order_number").eq("id", orderId).single();
    if (!o) return;
    await sb.from("orders").update({ payment_status: "paid", updated_at: now() }).eq("id", orderId);
    await sb.from("payments").insert({
      order_id: orderId,
      provider: "cod",
      provider_payment_id: "cod_" + o.order_number,
      method: "cod",
      amount: o.total,
      status: "captured",
    });
  }
  done(`/admin/orders/${orderId}`, "/admin/payments");
}

export async function refundOrder(orderId: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    const o = st.orders.find((x) => x.id === orderId);
    if (!o) return;
    o.payment_status = "refunded";
    st.payments.filter((p) => p.order_id === orderId && p.status === "captured").forEach((p) => (p.status = "refunded"));
  } else {
    const sb = await createClient();
    await sb.from("orders").update({ payment_status: "refunded", updated_at: now() }).eq("id", orderId);
    await sb.from("payments").update({ status: "refunded" }).eq("order_id", orderId).eq("status", "captured");
  }
  done(`/admin/orders/${orderId}`, "/admin/payments");
}

// ================================================================ delivery

export async function createShipment(orderId: string, form: FormData) {
  await guard();
  const courier = s(form, "courier") || COURIERS[0];
  const etaDays = Number(s(form, "eta") || 4);
  const awb = courier.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() + String(Date.now()).slice(-10);
  const eta = new Date(Date.now() + etaDays * 864e5).toISOString().slice(0, 10);
  const events: ShipmentEvent[] = [{ status: "created", label: SHIP_LABEL.created, location: "Surat, GJ", at: now() }];
  if (!isSupabaseConfigured) {
    const st = demo();
    if (st.shipments.some((x) => x.order_id === orderId)) return;
    st.shipments.unshift({ id: demoId(), order_id: orderId, courier, awb, status: "created", events, eta, created_at: now() });
    const o = st.orders.find((x) => x.id === orderId);
    if (o) o.status = "packed";
  } else {
    const sb = await createClient();
    await sb.from("shipments").insert({ order_id: orderId, courier, awb, status: "created", events, eta });
    await sb.from("orders").update({ status: "packed", updated_at: now() }).eq("id", orderId);
  }
  done(`/admin/orders/${orderId}`, "/admin/delivery");
}

const orderStatusFor: Partial<Record<Shipment["status"], OrderStatus>> = {
  picked_up: "shipped",
  in_transit: "shipped",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
};

/** Simulates the courier's tracking webhook moving the parcel one step forward. */
export async function advanceShipment(shipmentId: string) {
  await guard();
  let orderId = "";
  if (!isSupabaseConfigured) {
    const st = demo();
    const sh = st.shipments.find((x) => x.id === shipmentId);
    if (!sh) return;
    const idx = SHIP_FLOW.indexOf(sh.status as (typeof SHIP_FLOW)[number]);
    if (idx < 0 || idx >= SHIP_FLOW.length - 1) return;
    const next = SHIP_FLOW[idx + 1];
    const o = st.orders.find((x) => x.id === sh.order_id);
    const city = o ? `${o.shipping_address.city}, ${o.shipping_address.state}` : "";
    sh.status = next;
    sh.events = [...sh.events, ...shipmentEvents(next, now(), city).slice(-1).map((e) => ({ ...e, at: now() }))];
    if (o) {
      o.status = orderStatusFor[next] ?? o.status;
      if (next === "delivered" && o.payment_method === "cod" && o.payment_status !== "paid") {
        o.payment_status = "paid";
        st.payments.unshift({
          id: demoId(),
          order_id: o.id,
          provider: "cod",
          provider_payment_id: "cod_" + o.order_number,
          method: "cod",
          amount: o.total,
          status: "captured",
          created_at: now(),
        });
      }
    }
    orderId = sh.order_id;
  } else {
    const sb = await createClient();
    const { data: sh } = await sb.from("shipments").select("*, order:orders(*)").eq("id", shipmentId).single();
    if (!sh) return;
    const idx = SHIP_FLOW.indexOf(sh.status);
    if (idx < 0 || idx >= SHIP_FLOW.length - 1) return;
    const next = SHIP_FLOW[idx + 1];
    const o = sh.order;
    const loc =
      next === "picked_up" ? "Surat, GJ" : next === "in_transit" ? "Hub — Ahmedabad, GJ" : `${o.shipping_address.city}, ${o.shipping_address.state}`;
    await sb
      .from("shipments")
      .update({ status: next, events: [...(sh.events ?? []), { status: next, label: SHIP_LABEL[next], location: loc, at: now() }], updated_at: now() })
      .eq("id", shipmentId);
    const patch: Record<string, string> = { status: orderStatusFor[next] ?? o.status, updated_at: now() };
    if (next === "delivered" && o.payment_method === "cod" && o.payment_status !== "paid") {
      patch.payment_status = "paid";
      await sb.from("payments").insert({
        order_id: o.id,
        provider: "cod",
        provider_payment_id: "cod_" + o.order_number,
        method: "cod",
        amount: o.total,
        status: "captured",
      });
    }
    await sb.from("orders").update(patch).eq("id", o.id);
    orderId = o.id;
  }
  done(`/admin/orders/${orderId}`, "/admin/delivery");
}

// ================================================================ products

export async function saveProduct(id: string | null, form: FormData) {
  await guard();
  const name = s(form, "name");
  const row = {
    name,
    slug: slugify(s(form, "slug") || name),
    category_id: s(form, "category_id") || null,
    price: Number(s(form, "price") || 0),
    compare_at_price: numOrNull(s(form, "compare_at_price")),
    stock: Number(s(form, "stock") || 0),
    sku: s(form, "sku") || null,
    description: s(form, "description") || null,
    material: s(form, "material") || null,
    dimensions: s(form, "dimensions") || null,
    colors: s(form, "colors").split(",").map((c) => c.trim()).filter(Boolean),
    occasions: form.getAll("occasions").map(String),
    images: (JSON.parse(s(form, "images") || "[]") as string[]).filter(Boolean),
    is_featured: form.get("is_featured") === "on",
    is_new: form.get("is_new") === "on",
    is_active: form.get("is_active") === "on",
  };
  if (!name) throw new Error("Name is required");
  if (!isSupabaseConfigured) {
    const st = demo();
    const cat = st.categories.find((c) => c.id === row.category_id);
    const category = cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null;
    if (id) {
      const p = st.products.find((x) => x.id === id);
      if (p) Object.assign(p, row, { category });
    } else st.products.unshift({ ...row, id: demoId(), category, created_at: now() });
  } else {
    const sb = await createClient();
    const { error } = id
      ? await sb.from("products").update({ ...row, updated_at: now() }).eq("id", id)
      : await sb.from("products").insert(row);
    if (error) throw new Error(error.message);
  }
  done("/admin/products", "/", "/shop");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    st.products = st.products.filter((p) => p.id !== id);
  } else {
    const sb = await createClient();
    await sb.from("products").delete().eq("id", id);
  }
  done("/admin/products", "/");
  redirect("/admin/products");
}

export async function toggleProduct(id: string, field: "is_active" | "is_featured") {
  await guard();
  if (!isSupabaseConfigured) {
    const p = demo().products.find((x) => x.id === id);
    if (p) p[field] = !p[field];
  } else {
    const sb = await createClient();
    const { data } = await sb.from("products").select(field).eq("id", id).single();
    if (data) await sb.from("products").update({ [field]: !(data as Record<string, boolean>)[field] }).eq("id", id);
  }
  done("/admin/products", "/");
}

export async function saveCategory(id: string | null, form: FormData) {
  await guard();
  const name = s(form, "name");
  if (!name) return;
  const row = {
    name,
    slug: slugify(s(form, "slug") || name),
    description: s(form, "description") || null,
    image_url: s(form, "image_url") || null,
    sort_order: Number(s(form, "sort_order") || 0),
  };
  if (!isSupabaseConfigured) {
    const st = demo();
    if (id) Object.assign(st.categories.find((c) => c.id === id) ?? {}, row);
    else st.categories.push({ ...row, id: demoId() });
  } else {
    const sb = await createClient();
    if (id) await sb.from("categories").update(row).eq("id", id);
    else await sb.from("categories").insert(row);
  }
  done("/admin/products/categories", "/");
}

export async function deleteCategory(id: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    st.categories = st.categories.filter((c) => c.id !== id);
    st.products.forEach((p) => {
      if (p.category_id === id) {
        p.category_id = null;
        p.category = null;
      }
    });
  } else {
    const sb = await createClient();
    await sb.from("categories").delete().eq("id", id);
  }
  done("/admin/products/categories", "/");
}

// ================================================================ customers

export async function setRole(userId: string, role: "customer" | "admin") {
  await guard();
  if (!isSupabaseConfigured) {
    const p = demo().profiles.find((x) => x.id === userId);
    if (p) p.role = role;
  } else {
    const sb = await createClient();
    await sb.from("profiles").update({ role }).eq("id", userId);
  }
  done("/admin/customers");
}

export async function toggleBlock(userId: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const p = demo().profiles.find((x) => x.id === userId);
    if (p) p.is_blocked = !p.is_blocked;
  } else {
    const sb = await createClient();
    const { data } = await sb.from("profiles").select("is_blocked").eq("id", userId).single();
    if (data) await sb.from("profiles").update({ is_blocked: !data.is_blocked }).eq("id", userId);
  }
  done("/admin/customers");
}

// ================================================================ reviews

export async function setReviewStatus(id: string, status: Review["status"]) {
  await guard();
  if (!isSupabaseConfigured) {
    const r = demo().reviews.find((x) => x.id === id);
    if (r) r.status = status;
  } else {
    const sb = await createClient();
    await sb.from("reviews").update({ status }).eq("id", id);
  }
  done("/admin/reviews", "/");
}

export async function deleteReview(id: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    st.reviews = st.reviews.filter((r) => r.id !== id);
  } else {
    const sb = await createClient();
    await sb.from("reviews").delete().eq("id", id);
  }
  done("/admin/reviews");
}

// ================================================================ coupons

export async function saveCoupon(id: string | null, form: FormData) {
  await guard();
  const row = {
    code: s(form, "code").toUpperCase().replace(/\s+/g, ""),
    description: s(form, "description") || null,
    type: (s(form, "type") === "flat" ? "flat" : "percent") as "flat" | "percent",
    value: Number(s(form, "value") || 0),
    min_order: Number(s(form, "min_order") || 0),
    max_discount: numOrNull(s(form, "max_discount")),
    usage_limit: numOrNull(s(form, "usage_limit")),
    starts_at: s(form, "starts_at") ? new Date(s(form, "starts_at")).toISOString() : null,
    ends_at: s(form, "ends_at") ? new Date(s(form, "ends_at") + "T23:59:59").toISOString() : null,
    is_active: form.get("is_active") === "on",
  };
  if (!row.code) throw new Error("Code is required");
  if (!isSupabaseConfigured) {
    const st = demo();
    if (id) Object.assign(st.coupons.find((c) => c.id === id) ?? {}, row);
    else st.coupons.unshift({ ...row, id: demoId(), used_count: 0, created_at: now() });
  } else {
    const sb = await createClient();
    const { error } = id ? await sb.from("coupons").update(row).eq("id", id) : await sb.from("coupons").insert(row);
    if (error) throw new Error(error.message);
  }
  done("/admin/discounts");
  redirect("/admin/discounts");
}

export async function toggleCoupon(id: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const c = demo().coupons.find((x) => x.id === id);
    if (c) c.is_active = !c.is_active;
  } else {
    const sb = await createClient();
    const { data } = await sb.from("coupons").select("is_active").eq("id", id).single();
    if (data) await sb.from("coupons").update({ is_active: !data.is_active }).eq("id", id);
  }
  done("/admin/discounts");
}

export async function deleteCoupon(id: string) {
  await guard();
  if (!isSupabaseConfigured) {
    const st = demo();
    st.coupons = st.coupons.filter((c) => c.id !== id);
  } else {
    const sb = await createClient();
    await sb.from("coupons").delete().eq("id", id);
  }
  done("/admin/discounts");
}

// ================================================================ settings

export async function saveSettings(form: FormData) {
  await guard();
  const settings: StoreSettings = {
    payment: {
      provider: s(form, "pay_provider") || "razorpay",
      mode: s(form, "pay_mode") === "live" ? "live" : "test",
      key_id: s(form, "key_id"),
      upi_enabled: form.get("upi_enabled") === "on",
      card_enabled: form.get("card_enabled") === "on",
      netbanking_enabled: form.get("netbanking_enabled") === "on",
      cod_enabled: form.get("cod_enabled") === "on",
    },
    delivery: {
      provider: s(form, "ship_provider") || "shiprocket",
      mode: s(form, "ship_mode") === "live" ? "live" : "test",
      pickup_pincode: s(form, "pickup_pincode"),
      free_shipping_above: Number(s(form, "free_shipping_above") || 0),
      flat_fee: Number(s(form, "flat_fee") || 0),
      couriers: s(form, "couriers").split(",").map((c) => c.trim()).filter(Boolean),
    },
  };
  if (!isSupabaseConfigured) demo().settings = settings;
  else {
    const sb = await createClient();
    await sb.from("store_settings").update({ ...settings, updated_at: now() }).eq("id", 1);
  }
  done("/admin/settings", "/checkout");
}
