"use client";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { img, inr } from "@/lib/format";

const FREE_SHIPPING = 1999;

export function CartDrawer() {
  const { items, open, setOpen, subtotal, update, remove } = useCart();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  const left = Math.max(0, FREE_SHIPPING - subtotal);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-ivory shadow-2xl transition-transform duration-700 ease-[var(--ease-lux)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-display text-2xl">Your Bag</p>
          <button onClick={() => setOpen(false)} aria-label="Close bag" className="rounded-full p-2 hover:bg-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-line px-6 py-4">
          <p className="text-[13px] text-muted">
            {left > 0 ? (
              <>You&apos;re <b className="text-ink">{inr(left)}</b> away from free shipping</>
            ) : (
              <>You&apos;ve unlocked <b className="text-ink">free shipping</b> ✦</>
            )}
          </p>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-sand">
            <div className="h-full bg-gold transition-all duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-3xl italic">Your bag is waiting</p>
              <p className="mt-2 text-sm text-muted">Find the piece that completes the look.</p>
              <Link href="/shop" onClick={() => setOpen(false)} className="btn-dark mt-6">
                Explore the collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.productId + i.color} className="flex gap-4 py-5">
                  <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(i.image, 300)} alt={i.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-display text-[17px] leading-tight">{i.name}</p>
                        {i.color && <p className="mt-1 text-xs text-muted">{i.color}</p>}
                      </div>
                      <p className="text-sm">{inr(i.price * i.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button className="p-2" aria-label="Decrease" onClick={() => update(i.productId, i.color, i.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{i.quantity}</span>
                        <button className="p-2" aria-label="Increase" onClick={() => update(i.productId, i.color, i.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => remove(i.productId, i.color)} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{inr(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping & offers calculated at checkout.</p>
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn-dark mt-5 w-full">
              Checkout
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-xs uppercase tracking-[0.2em] text-muted hover:text-ink">
              View bag
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
