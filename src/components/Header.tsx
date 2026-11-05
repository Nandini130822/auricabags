"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { AccountMenu } from "./AccountMenu";
import { Logo } from "./Logo";
import { useCart } from "./CartProvider";
import type { Category } from "@/lib/types";

const NAV = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?occasion=wedding", label: "Wedding Edit" },
  { href: "/shop?category=clutches", label: "Clutches" },
  { href: "/shop?category=potli-bags", label: "Potlis" },
  { href: "/shop?category=handbags", label: "Handbags" },
  { href: "/wholesale", label: "Wholesale" },
];

export function Header({
  categories,
  signedIn,
  userName = null,
  isAdmin = false,
}: {
  categories: Category[];
  signedIn: boolean;
  userName?: string | null;
  isAdmin?: boolean;
}) {
  const path = usePathname();
  const router = useRouter();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [path]);

  return (
    <>
      <div className="bg-ink text-ivory">
        <div className="container-lux flex min-h-9 items-center justify-center py-2 text-center text-[11px] uppercase leading-snug tracking-[0.14em] sm:tracking-[0.24em]">
          <span className="hidden sm:inline">Free shipping above ₹1,999&nbsp;&nbsp;·&nbsp;&nbsp;</span>
          Code <b className="mx-1.5 text-gold-soft">AURICA10</b> for 10% off your first order
        </div>
      </div>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-line bg-ivory/90 backdrop-blur-md" : "border-b border-transparent bg-ivory"
        }`}
      >
        <div className="container-lux flex h-[68px] items-center justify-between gap-3 text-ink sm:h-[76px] sm:gap-6">
          <div className="flex items-center gap-3 xl:hidden">
            <button onClick={() => setMenu(!menu)} aria-label="Menu" className="-ml-2 p-2.5">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <Logo />
          <nav className="hidden items-center gap-6 xl:flex xl:gap-8">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="group relative whitespace-nowrap text-[12px] uppercase tracking-[0.2em]">
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-current transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center sm:gap-2">
            <button onClick={() => setSearch(!search)} aria-label="Search" className="p-2.5 sm:p-2">
              <Search className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </button>
            <Link href={signedIn ? "/account/wishlist" : "/login"} aria-label="Wishlist" className="hidden p-2 sm:block">
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </Link>
            <AccountMenu name={signedIn ? (userName ?? "") : null} isAdmin={isAdmin} />
            <button onClick={() => setOpen(true)} aria-label="Open bag" className="relative -mr-2 p-2.5 sm:mr-0 sm:p-2">
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-medium text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {search && (
          <div className="border-t border-line bg-ivory">
            <form
              className="container-lux flex items-center gap-4 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/shop?q=${encodeURIComponent(q)}`);
              }}
            >
              <Search className="h-5 w-5 text-muted" strokeWidth={1.5} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search clutches, potlis, colours…"
                className="flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted/60"
              />
              <button className="link-arrow">Search</button>
            </form>
          </div>
        )}

        {menu && (
          <div className="h-[calc(100dvh-104px)] overflow-y-auto border-t border-line bg-ivory xl:hidden">
            <div className="container-lux py-8">
              {NAV.map((n, i) => (
                <Link key={n.href} href={n.href} className="flex items-baseline gap-4 border-b border-line py-4">
                  <span className="text-[11px] text-muted">0{i + 1}</span>
                  <span className="font-display text-3xl">{n.label}</span>
                </Link>
              ))}
              <p className="eyebrow mt-10">Categories</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-full border border-line px-4 py-2 text-sm">
                    {c.name}
                  </Link>
                ))}
              </div>
              <div className="mt-10 flex gap-3">
                <Link href={signedIn ? "/account" : "/login"} className="btn-dark flex-1">
                  {signedIn ? "My account" : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
