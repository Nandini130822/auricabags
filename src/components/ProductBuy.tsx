"use client";
import { useState, useTransition } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { useCart } from "./CartProvider";
import { toggleWishlist } from "@/app/actions/shop";
import { discountPct, inr } from "@/lib/format";
import type { Product } from "@/lib/types";

const SWATCH: Record<string, string> = {
  champagne: "#e8d6b5", silver: "#c9c9cb", "rose pink": "#e9b9c0", ivory: "#f4ecdc", black: "#1c1a17", bronze: "#9b6a3c",
  gold: "#c9a45c", maroon: "#6d1f2a", emerald: "#1f6b52", "rani pink": "#d23a7a", rouge: "#a8262c", beige: "#d9c4a4",
  saffron: "#e8a530", lilac: "#b9a3d0", blush: "#efc5c0", grey: "#9b9a98", tan: "#c19066", "rose gold": "#d5a38c",
  cognac: "#8a4b26", "pearl white": "#f3efe8",
};

export function ProductBuy({ product: p }: { product: Product }) {
  const { add } = useCart();
  const [color, setColor] = useState<string | null>(p.colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const off = discountPct(p.price, p.compare_at_price);
  const soldOut = p.stock <= 0;

  return (
    <div>
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-2xl">{inr(p.price)}</span>
        {off > 0 && (
          <>
            <span className="text-muted line-through">{inr(p.compare_at_price)}</span>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs text-gold-deep">Save {off}%</span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>

      {p.colors.length > 0 && (
        <div className="mt-8">
          <p className="field-label">
            Colour — <span className="text-ink normal-case tracking-normal">{color}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {p.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                title={c}
                className={`h-9 w-9 rounded-full border-2 p-0.5 transition ${color === c ? "border-ink" : "border-transparent hover:border-line"}`}
              >
                <span className="block h-full w-full rounded-full border border-line" style={{ background: SWATCH[c.toLowerCase()] ?? "#ddd" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button className="p-4" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center">{qty}</span>
          <button className="p-4" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          disabled={soldOut}
          onClick={() =>
            add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? "", price: p.price, color, quantity: qty, stock: p.stock })
          }
          className="btn-dark flex-1"
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
        <button
          aria-label="Save to wishlist"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await toggleWishlist(p.id);
              if (r.ok) setSaved(r.saved);
              setMsg(r.ok ? (r.saved ? "Saved to your wishlist" : "Removed from wishlist") : r.error);
            })
          }
          className={`flex h-[50px] w-[50px] items-center justify-center rounded-full border border-line transition hover:border-ink ${saved ? "text-rose" : ""}`}
        >
          <Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} strokeWidth={1.5} />
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-muted">{msg}</p>}
      {p.stock > 0 && p.stock <= 5 && <p className="mt-3 text-sm text-rose">Only {p.stock} left — order soon.</p>}

      <div className="mt-8 grid grid-cols-3 gap-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted">
        {[
          [Truck, "Ships in 48h"],
          [ShieldCheck, "COD available"],
          [RefreshCcw, "7-day exchange"],
        ].map(([Icon, t]) => {
          const I = Icon as typeof Truck;
          return (
            <div key={t as string} className="rounded-2xl border border-line px-2 py-4">
              <I className="mx-auto mb-2 h-5 w-5 text-gold" strokeWidth={1.4} />
              {t as string}
            </div>
          );
        })}
      </div>
    </div>
  );
}
