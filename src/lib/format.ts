export const inr = (n: number | string | null | undefined) =>
  "₹" + Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const date = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const dateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Unsplash images get sized params; anything else passes through untouched. */
export const img = (url: string | null | undefined, w = 1200) => {
  if (!url) return "/placeholder.svg";
  if (url.includes("images.unsplash.com")) {
    const base = url.split("?")[0];
    return `${base}?auto=format&fit=crop&w=${w}&q=80`;
  }
  return url;
};

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const LABELS: Record<string, string> = { upi: "UPI", cod: "Cash on delivery", netbanking: "Netbanking", awb: "AWB" };
export const label = (s: string) =>
  LABELS[s] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const discountPct = (price: number, compare: number | null) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
