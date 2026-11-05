"use client";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { img, inr } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, update, remove, ready } = useCart();
  if (!ready)
    return (
      <section className="container-lux py-24">
        <div className="h-96 animate-pulse rounded-[28px] bg-cream/60" />
      </section>
    );
  return (
    <section className="container-lux py-16 lg:py-24">
      <h1 className="h-display text-[clamp(44px,6vw,88px)]">Your bag</h1>
      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl italic">Your bag is empty.</p>
          <Link href="/shop" className="btn-dark mt-8">Explore the collection</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.productId + i.color} className="flex gap-5 py-6">
                <Link href={`/product/${i.slug}`} className="h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(i.image, 300)} alt={i.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${i.slug}`} className="font-display text-xl">{i.name}</Link>
                      {i.color && <p className="mt-1 text-sm text-muted">{i.color}</p>}
                      <p className="mt-1 text-sm text-muted">{inr(i.price)} each</p>
                    </div>
                    <button onClick={() => remove(i.productId, i.color)} aria-label="Remove" className="self-start p-1 text-muted hover:text-ink">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line">
                      <button className="p-3" onClick={() => update(i.productId, i.color, i.quantity - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <button className="p-3" onClick={() => update(i.productId, i.color, i.quantity + 1)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                    </div>
                    <p>{inr(i.price * i.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-[24px] bg-cream/70 p-8 lg:sticky lg:top-28">
            <p className="font-display text-2xl">Summary</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{subtotal >= 1999 ? "Free" : "Calculated at checkout"}</span></div>
            </div>
            <Link href="/checkout" className="btn-dark mt-8 w-full">Proceed to checkout</Link>
            <p className="mt-4 text-center text-xs text-muted">Have a code? Apply it at checkout.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
