import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPct, img, inr } from "@/lib/format";

export function ProductCard({ p, index, tall = false }: { p: Product; index?: number; tall?: boolean }) {
  const off = discountPct(p.price, p.compare_at_price);
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className={`relative overflow-hidden rounded-[22px] bg-cream ${tall ? "aspect-[3/4.2]" : "aspect-[4/5]"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(p.images[0], 800)} alt={p.name} loading="lazy" className="zoom-img absolute inset-0 h-full w-full object-cover" />
        {p.images[1] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img(p.images[1], 800)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.is_new && <span className="rounded-full bg-ivory/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em]">New</span>}
          {off > 0 && <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ivory">−{off}%</span>}
        </div>
        {p.stock > 0 && p.stock <= 5 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ivory/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose">
            Only {p.stock} left
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink/80 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-ivory">
            Sold out
          </span>
        )}
        {typeof index === "number" && (
          <span className="absolute right-4 top-3 font-display text-sm text-ivory mix-blend-difference">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="font-display text-[19px] leading-tight">{p.name}</p>
          <p className="mt-1 text-[12px] text-muted">{p.category?.name}{p.colors.length > 1 ? ` · ${p.colors.length} colours` : ""}</p>
        </div>
        <div className="text-right">
          <p className="text-[15px]">{inr(p.price)}</p>
          {off > 0 && <p className="text-[12px] text-muted line-through">{inr(p.compare_at_price)}</p>}
        </div>
      </div>
    </Link>
  );
}
