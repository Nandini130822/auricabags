import "server-only";
import catalog from "@/data/catalog.json";
import type {
  Category,
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  Product,
  Profile,
  Review,
  Shipment,
  ShipmentEvent,
  StoreSettings,
} from "@/lib/types";

/**
 * In-memory store used when Supabase is not configured ("demo mode").
 * Lets the client click through the whole storefront + admin flow before the
 * database is connected. Data resets when the server restarts.
 */
type Store = {
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  reviews: Review[];
  profiles: Profile[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  shipments: Shipment[];
  settings: StoreSettings;
  seq: number;
};

const daysAgo = (d: number, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();
let idc = 0;
export const demoId = () => `demo-${Date.now().toString(36)}-${(idc++).toString(36)}`;

export const COURIERS = ["Delhivery", "Blue Dart", "Xpressbees", "DTDC"];

export function shipmentEvents(status: Shipment["status"], start: string, city: string): ShipmentEvent[] {
  const steps: [Shipment["status"], string, string][] = [
    ["created", "Shipment created", "Surat, GJ"],
    ["picked_up", "Picked up from Aurica studio", "Surat, GJ"],
    ["in_transit", "In transit", "Hub — Ahmedabad, GJ"],
    ["out_for_delivery", "Out for delivery", city],
    ["delivered", "Delivered", city],
  ];
  const idx = steps.findIndex((s) => s[0] === status);
  const t0 = new Date(start).getTime();
  return steps.slice(0, idx + 1).map((s, i) => ({
    status: s[0],
    label: s[1],
    location: s[2],
    at: new Date(t0 + i * 20 * 36e5).toISOString(),
  }));
}

function build(): Store {
  const categories: Category[] = catalog.categories;
  const products: Product[] = catalog.products.map((p, i) => {
    const cat = categories.find((c) => c.slug === p.category_slug)!;
    const { category_slug: _omit, ...rest } = p;
    void _omit;
    return {
      ...rest,
      category_id: cat.id,
      category: { id: cat.id, name: cat.name, slug: cat.slug },
      is_active: true,
      created_at: daysAgo(40 - i),
    };
  });
  const coupons: Coupon[] = catalog.coupons.map((c, i) => ({
    ...c,
    type: c.type as Coupon["type"],
    id: `coupon-${i}`,
    used_count: [34, 12, 0][i] ?? 0,
    starts_at: null,
    ends_at: null,
    created_at: daysAgo(60),
  }));

  const people = [
    ["Riya Mehta", "riya.mehta@example.com", "Surat", "Gujarat", "395007"],
    ["Ananya Shah", "ananya.shah@example.com", "Ahmedabad", "Gujarat", "380015"],
    ["Priya Kapoor", "priya.k@example.com", "Mumbai", "Maharashtra", "400050"],
    ["Sneha Patel", "sneha.patel@example.com", "Vadodara", "Gujarat", "390007"],
    ["Kavya Iyer", "kavya.iyer@example.com", "Bengaluru", "Karnataka", "560038"],
    ["Meera Joshi", "meera.joshi@example.com", "Pune", "Maharashtra", "411001"],
    ["Ishita Desai", "ishita.d@example.com", "Jaipur", "Rajasthan", "302001"],
    ["Aarohi Singh", "aarohi.singh@example.com", "New Delhi", "Delhi", "110024"],
  ];
  const profiles: Profile[] = [
    {
      id: "demo-admin",
      email: "admin@auricabags.com",
      full_name: "Aurica Admin",
      phone: "+91 78599 00000",
      avatar_url: null,
      role: "admin",
      is_blocked: false,
      created_at: daysAgo(90),
    },
    ...people.map((p, i) => ({
      id: `demo-user-${i}`,
      email: p[1],
      full_name: p[0],
      phone: `+91 98${(25000000 + i * 1371337).toString().slice(0, 8)}`,
      avatar_url: null,
      role: "customer" as const,
      is_blocked: false,
      created_at: daysAgo(80 - i * 7),
    })),
  ];

  const plan: [number, number[], OrderStatus, PaymentMethod, number][] = [
    // [person, product idx[], status, method, days ago]
    [0, [0, 3], "delivered", "upi", 24],
    [1, [5], "delivered", "card", 20],
    [2, [7, 13], "shipped", "upi", 6],
    [3, [3, 4, 4], "out_for_delivery", "cod", 4],
    [4, [9], "packed", "card", 2],
    [5, [1], "confirmed", "upi", 1],
    [6, [11, 0], "confirmed", "netbanking", 0],
    [7, [6], "pending", "cod", 0],
    [0, [8], "cancelled", "upi", 12],
    [2, [12], "delivered", "card", 15],
    [1, [2, 10], "returned", "upi", 18],
  ];

  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  const payments: Payment[] = [];
  const shipments: Shipment[] = [];
  let seq = 1001;

  plan.forEach(([pi, items, status, method, ago], i) => {
    const person = people[pi];
    const id = `demo-order-${i}`;
    const created = daysAgo(ago, 3 + i);
    const lines = items.map((idx, j) => {
      const p = products[idx];
      return {
        id: `${id}-item-${j}`,
        order_id: id,
        product_id: p.id,
        name: p.name,
        image: p.images[0],
        color: p.colors[0] ?? null,
        price: p.price,
        quantity: 1,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const discount = i % 3 === 0 ? Math.min(500, Math.round(subtotal * 0.1)) : 0;
    const shipping_fee = subtotal >= 1999 ? 0 : 99;
    const total = subtotal - discount + shipping_fee;
    const paid = method !== "cod" ? status !== "pending" : status === "delivered";
    const payment_status =
      status === "returned" ? "refunded" : status === "cancelled" ? "refunded" : paid ? "paid" : "pending";
    const address = {
      full_name: person[0],
      phone: profiles[pi + 1].phone!,
      line1: `${12 + i * 3}, ${["Rose Villa", "Shanti Kunj", "Sea Breeze Apts", "Gulmohar Park"][i % 4]}`,
      line2: ["Near City Light", "Ring Road", "Linking Road", "MG Road"][i % 4],
      city: person[2],
      state: person[3],
      pincode: person[4],
    };
    orders.push({
      id,
      order_number: `AUR${seq++}`,
      user_id: `demo-user-${pi}`,
      email: person[1],
      customer_name: person[0],
      phone: address.phone,
      shipping_address: address,
      subtotal,
      discount,
      shipping_fee,
      total,
      coupon_code: discount ? "AURICA10" : null,
      status,
      payment_status,
      payment_method: method,
      notes: null,
      created_at: created,
    });
    orderItems.push(...lines);
    if (method !== "cod" && status !== "pending") {
      payments.push({
        id: `demo-pay-${i}`,
        order_id: id,
        provider: "razorpay_demo",
        provider_payment_id: `pay_demo${(1e9 + i * 7919).toString(36)}`,
        method,
        amount: total,
        status: payment_status === "refunded" ? "refunded" : "captured",
        created_at: created,
      });
    }
    const shipStatus: Partial<Record<OrderStatus, Shipment["status"]>> = {
      shipped: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      returned: "rto",
    };
    const ss = shipStatus[status];
    if (ss) {
      const courier = COURIERS[i % COURIERS.length];
      shipments.push({
        id: `demo-ship-${i}`,
        order_id: id,
        courier,
        awb: `${courier.slice(0, 2).toUpperCase()}${(7400000000 + i * 104729).toString()}`,
        status: ss,
        events:
          ss === "rto"
            ? [...shipmentEvents("delivered", created, address.city), { status: "rto", label: "Returned to origin", location: "Surat, GJ", at: daysAgo(ago - 5) }]
            : shipmentEvents(ss, created, `${address.city}, ${address.state}`),
        eta: new Date(new Date(created).getTime() + 5 * 864e5).toISOString().slice(0, 10),
        created_at: created,
      });
    }
  });

  const reviewSeed: [number, number, number, string, string, Review["status"]][] = [
    [0, 0, 5, "Stole the show at my reception", "The crystals sparkle beautifully under lights. Got so many compliments!", "approved"],
    [3, 3, 5, "Perfect for mehendi", "Lovely embroidery and very roomy. Looks far more expensive than it is.", "approved"],
    [5, 1, 4, "Gorgeous colour", "The red is rich and the structure holds well. Strap could be a little longer.", "approved"],
    [7, 2, 5, "Quiet luxury", "Exactly like the photos — soft ivory and so elegant.", "approved"],
    [9, 4, 4, "Cute and sturdy", "Fits my phone and lipstick. Love the finish.", "approved"],
    [11, 6, 5, "Dance-floor ready", "Lightweight and goes with everything.", "pending"],
    [1, 5, 3, "Nice but small", "Beautiful clutch, though a bit smaller than I expected.", "pending"],
    [12, 7, 5, "Daily favourite", "Very well organised inside. Great value.", "approved"],
    [3, 2, 5, "Bought three for my bridesmaids", "Everyone loved them. Will order again for wholesale.", "approved"],
  ];
  const reviews: Review[] = reviewSeed.map(([pi, ui, rating, title, body, status], i) => ({
    id: `demo-review-${i}`,
    product_id: products[pi].id,
    user_id: `demo-user-${ui}`,
    author_name: people[ui][0].split(" ")[0] + " " + people[ui][0].split(" ")[1][0] + ".",
    rating,
    title,
    body,
    status,
    created_at: daysAgo(30 - i * 3),
    product: { name: products[pi].name, slug: products[pi].slug },
  }));

  return {
    categories,
    products,
    coupons,
    reviews,
    profiles,
    orders,
    orderItems,
    payments,
    shipments,
    settings: {
      payment: {
        provider: "razorpay",
        mode: "test",
        key_id: "rzp_test_demo1234",
        cod_enabled: true,
        upi_enabled: true,
        card_enabled: true,
        netbanking_enabled: true,
      },
      delivery: {
        provider: "shiprocket",
        mode: "test",
        pickup_pincode: "395009",
        free_shipping_above: 1999,
        flat_fee: 99,
        couriers: COURIERS,
      },
    },
    seq,
  };
}

const g = globalThis as unknown as { __auricaDemo?: Store };
export function demo(): Store {
  if (!g.__auricaDemo) g.__auricaDemo = build();
  return g.__auricaDemo;
}

export function hydrateOrder(o: Order): Order {
  const s = demo();
  return {
    ...o,
    order_items: s.orderItems.filter((i) => i.order_id === o.id),
    payments: s.payments.filter((p) => p.order_id === o.id),
    shipments: s.shipments.filter((x) => x.order_id === o.id),
  };
}
