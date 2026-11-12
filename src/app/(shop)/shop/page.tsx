import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { getCategories, getProducts, type ProductFilter } from "@/lib/data";
import { OCCASIONS } from "@/lib/config";
import { img } from "@/lib/format";

export const metadata: Metadata = { title: "Shop" };

const PRICES = [
  { label: "Under ₹1,500", min: 0, max: 1500 },
  { label: "₹1,500 – ₹2,500", min: 1500, max: 2500 },
  { label: "₹2,500 & above", min: 2500, max: 0 },
];

/** Header photo for each occasion edit (same looks as the homepage occasion tiles). */
const OCCASION_IMAGE: Record<string, string> = {
  wedding: "/images/products/gold-zari-flower-bag.webp",
  reception: "/images/products/pearl-frame-clutch.webp",
  sangeet: "https://images.unsplash.com/photo-1767771322982-8041f4a5da8e",
  mehendi: "/images/insta/shell-mini-potli.webp",
  festive: "https://images.unsplash.com/photo-1759064716592-3963a0881ff8",
  party: "/images/products/midnight-envelope-clutch/1-black.webp",
  everyday: "/images/products/cognac-everyday-purse/1-cognac.webp",
};

type SP = { category?: string; occasion?: string; q?: string; sort?: string; min?: string; max?: string };

export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: sp.category,
      occasion: sp.occasion,
      q: sp.q,
      sort: (sp.sort as ProductFilter["sort"]) ?? "featured",
      min: sp.min ? Number(sp.min) : undefined,
      max: sp.max ? Number(sp.max) : undefined,
    }),
  ]);
  const cat = categories.find((c) => c.slug === sp.category);
  const title = cat?.name ?? (sp.occasion ? `The ${sp.occasion[0].toUpperCase()}${sp.occasion.slice(1)} Edit` : sp.q ? `“${sp.q}”` : "All Bags");
  const desc = cat?.description ?? "Clutches, potlis and handbags hand-finished for every celebration.";

  // header photo for this collection
  const heroImage =
    cat?.image_url ?? (sp.occasion ? OCCASION_IMAGE[sp.occasion.toLowerCase()] : undefined) ?? "/images/hero/pearl-beaded-bag.webp";

  const href = (patch: Partial<SP>) => {
    const next = { ...sp, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    return `/shop${qs.toString() ? `?${qs}` : ""}`;
  };
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[13px] transition ${active ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink"}`;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-lux grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-12">
          <div>
            <p className="eyebrow">
              <Link href="/" className="tap">Home</Link> / Shop{cat ? ` / ${cat.name}` : ""}
            </p>
            <h1 className="h-display mt-4 text-[clamp(40px,5.4vw,80px)]">{title}</h1>
            <p className="mt-4 max-w-lg text-muted">{desc}</p>
          </div>
          {/* one clean photo for the collection */}
          <div className="hidden h-[280px] overflow-hidden rounded-[22px] bg-sand lg:block" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(heroImage, 1200)} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-lux py-10">
        <div className="flex flex-col gap-5 border-b border-line pb-8">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <Link href={href({ category: undefined })} className={chip(!sp.category)}>All</Link>
            {categories.map((c) => (
              <Link key={c.id} href={href({ category: c.slug })} className={`${chip(sp.category === c.slug)} whitespace-nowrap`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 text-[13px]">
              <span className="eyebrow mr-2 shrink-0">Occasion</span>
              {OCCASIONS.map((o) => {
                const v = o.toLowerCase();
                const on = sp.occasion === v;
                return (
                  <Link key={o} href={href({ occasion: on ? undefined : v })} className={`tap shrink-0 border-b pb-0.5 transition ${on ? "border-gold text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                    {o}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 text-[13px] md:flex">
                {PRICES.map((p) => {
                  const on = sp.min === String(p.min) && (sp.max ?? "0") === String(p.max);
                  return (
                    <Link
                      key={p.label}
                      href={href(on ? { min: undefined, max: undefined } : { min: String(p.min), max: p.max ? String(p.max) : undefined })}
                      className={on ? "text-ink underline underline-offset-4" : "text-muted hover:text-ink"}
                    >
                      {p.label}
                    </Link>
                  );
                })}
              </div>
              <SortSelect value={sp.sort ?? "featured"} />
            </div>
          </div>
        </div>

        <p className="mt-6 text-[12px] uppercase tracking-[0.2em] text-muted">{products.length} pieces</p>

        {products.length === 0 ? (
          <div className="py-28 text-center">
            <p className="font-serif text-4xl italic">Nothing here — yet.</p>
            <p className="mt-3 text-muted">Try another filter, or explore the full collection.</p>
            <Link href="/shop" className="btn-dark mt-8">View all bags</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <div key={p.id} className={i % 7 === 3 ? "xl:row-span-1" : ""}>
                <ProductCard p={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
