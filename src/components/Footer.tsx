import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Instagram } from "./InstagramIcon";
import { Logo } from "./Logo";
import { SITE } from "@/lib/config";
import { Newsletter } from "./Newsletter";

const cols = [
  {
    title: "Shop",
    links: [
      ["All bags", "/shop"],
      ["Clutches", "/shop?category=clutches"],
      ["Potli bags", "/shop?category=potli-bags"],
      ["Handbags", "/shop?category=handbags"],
      ["New arrivals", "/shop?sort=new"],
    ],
  },
  {
    title: "Occasions",
    links: [
      ["Wedding", "/shop?occasion=wedding"],
      ["Reception", "/shop?occasion=reception"],
      ["Sangeet & Mehendi", "/shop?occasion=sangeet"],
      ["Festive", "/shop?occasion=festive"],
      ["Everyday", "/shop?occasion=everyday"],
    ],
  },
  {
    title: "Help",
    links: [
      ["My account", "/account"],
      ["Track order", "/account/orders"],
      ["Shipping & returns", "/policies/shipping"],
      ["Privacy", "/policies/privacy"],
      ["Wholesale", "/wholesale"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="grain bg-ink text-ivory">
      <div className="container-lux grid gap-14 py-20 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo light />
          <p className="mt-8 max-w-sm font-serif text-[26px] leading-snug italic text-ivory/90">
            “Luxury looks, without the luxury price.”
          </p>
          <Newsletter />
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="eyebrow text-ivory/50">{c.title}</p>
              <ul className="mt-5 space-y-3 text-[14px]">
                {c.links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="text-ivory/80 transition hover:text-gold-soft">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow text-ivory/50">Studio</p>
            <ul className="mt-5 space-y-3 text-[14px] text-ivory/80">
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{SITE.address}</li>
              <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{SITE.phone}</li>
              <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{SITE.email}</li>
              <li>
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-gold-soft">
                  <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-gold" />@aurica_bags
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-[12px] text-ivory/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Aurica Bags, Surat. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">UPI · Cards · Netbanking · Cash on delivery</p>
        </div>
      </div>
    </footer>
  );
}
