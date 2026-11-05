"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgePercent,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const links = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            active(href) ? "bg-ink text-ivory" : "text-ink/70 hover:bg-cream hover:text-ink"
          }`}
        >
          <Icon size={17} strokeWidth={1.6} />
          <span className="flex-1">{label}</span>
          {badges[href] ? (
            <span className={`rounded-full px-1.5 text-[11px] ${active(href) ? "bg-ivory/20" : "bg-gold/20 text-gold-deep"}`}>{badges[href]}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-baseline gap-2">
      <span className="font-display text-xl tracking-[0.18em]">AURICA</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Admin</span>
    </Link>
  );

  return (
    <>
      {/* desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex print:hidden">
        <div className="mb-8 px-3">{brand}</div>
        {links}
        <Link href="/" className="mt-auto flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-ink">
          <ExternalLink size={15} /> View store
        </Link>
      </aside>

      {/* mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden print:hidden">
        {brand}
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded-lg p-2 ring-1 ring-line">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 top-[57px] z-30 border-b border-line bg-white p-4 shadow-lg lg:hidden">
          {links}
          <Link href="/" className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-muted">
            <ExternalLink size={15} /> View store
          </Link>
        </div>
      )}
    </>
  );
}
