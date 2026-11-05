"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutGrid, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { signOut } from "@/app/actions/shop";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
      {LINKS.map((l) => {
        const on = l.href === "/account" ? path === l.href : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm transition lg:rounded-xl ${on ? "bg-ink text-ivory" : "hover:bg-cream"}`}
          >
            <l.icon className="h-4 w-4" strokeWidth={1.5} /> {l.label}
          </Link>
        );
      })}
      <form action={signOut}>
        <button className="flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm text-muted hover:bg-cream lg:w-full lg:rounded-xl">
          <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign out
        </button>
      </form>
    </nav>
  );
}
