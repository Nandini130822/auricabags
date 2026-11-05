export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** When Supabase keys are missing the site runs in "demo mode" on local sample data. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SITE = {
  name: "Aurica Bags",
  tagline: "Luxury looks, without the luxury price.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@auricabags.com",
  phone: "+91 78599 00000",
  whatsapp: "917859900000",
  instagram: "https://www.instagram.com/aurica_bags/",
  address: "Adajan, Surat, Gujarat 395009",
};

export const OCCASIONS = ["Wedding", "Reception", "Sangeet", "Mehendi", "Festive", "Party", "Everyday"] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
] as const;
