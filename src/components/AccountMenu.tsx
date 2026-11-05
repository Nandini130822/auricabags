"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LayoutGrid, LogOut, Package, Shield, User } from "lucide-react";
import { signOut } from "@/app/actions/shop";

/**
 * Header account control. Signed out: "Sign in". Signed in: "Hi, <first name>"
 * with a small menu (account, orders, wishlist, admin for admins, sign out).
 * The text label shows on laptops; phones keep just the icon.
 */
export function AccountMenu({ name, isAdmin }: { name: string | null; isAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (name === null)
    return (
      <Link href="/login" aria-label="Sign in" className="flex items-center gap-2 p-2.5 sm:p-2">
        <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
        <span className="hidden text-[12px] uppercase tracking-[0.16em] lg:inline">Sign in</span>
      </Link>
    );

  const first = name.trim().split(/\s+/)[0];
  const items = [
    { href: "/account", label: "My account", icon: LayoutGrid },
    { href: "/account/orders", label: "My orders", icon: Package },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard", icon: Shield }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2 p-2.5 sm:p-2"
      >
        <User className="h-[19px] w-[19px]" strokeWidth={1.5} />
        <span className="hidden max-w-[120px] truncate text-[13px] lg:inline">{first ? `Hi, ${first}` : "My account"}</span>
        <ChevronDown className={`hidden h-3.5 w-3.5 transition lg:block ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.35)]">
          <p className="px-4 pb-2 pt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{first ? `Signed in as ${first}` : "Your account"}</p>
          {items.map((it) => (
            <Link key={it.href} href={it.href} className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cream ${it.href === "/admin" ? "text-gold-deep" : ""}`}>
              <it.icon className="h-4 w-4" strokeWidth={1.5} /> {it.label}
            </Link>
          ))}
          <form action={signOut} className="mt-1 border-t border-line pt-1">
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-muted hover:bg-cream hover:text-ink">
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
