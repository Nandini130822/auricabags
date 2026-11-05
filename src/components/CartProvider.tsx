"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  ready: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem) => void;
  update: (productId: string, color: string | null, qty: number) => void;
  remove: (productId: string, color: string | null) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "aurica.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const same = (a: CartItem, id: string, color: string | null) => a.productId === id && a.color === color;

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const hit = prev.find((p) => same(p, item.productId, item.color));
      if (hit)
        return prev.map((p) =>
          same(p, item.productId, item.color) ? { ...p, quantity: Math.min(p.stock, p.quantity + item.quantity) } : p,
        );
      return [...prev, item];
    });
    setOpen(true);
  }, []);
  const update = useCallback((id: string, color: string | null, qty: number) => {
    setItems((prev) =>
      prev.map((p) => (same(p, id, color) ? { ...p, quantity: Math.max(1, Math.min(p.stock, qty)) } : p)),
    );
  }, []);
  const remove = useCallback((id: string, color: string | null) => {
    setItems((prev) => prev.filter((p) => !same(p, id, color)));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price, 0),
      open,
      ready,
      setOpen,
      add,
      update,
      remove,
      clear,
    }),
    [items, open, ready, add, update, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
