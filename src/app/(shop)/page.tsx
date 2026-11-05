import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { Instagram } from "@/components/InstagramIcon";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { getCategories, getLatestReviews, getProducts } from "@/lib/data";
import { img, inr } from "@/lib/format";
import { SITE } from "@/lib/config";

const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

const OCCASIONS = [
  { n: "01", title: "The Wedding", sub: "Potlis & bridal clutches", slug: "wedding", image: U("1610173827043-9db50e0d8ef9") },
  { n: "02", title: "Reception Night", sub: "Crystal & satin minaudières", slug: "reception", image: U("1776841818483-700f88aace44") },
  { n: "03", title: "Sangeet & Mehendi", sub: "Colour, beads & tassels", slug: "sangeet", image: U("1617627143750-d86bc21e42bb") },
  { n: "04", title: "Cocktail & Party", sub: "Metallics after dark", slug: "party", image: U("1742626181959-f6442aea029b") },
  { n: "05", title: "Festive", sub: "Zari, silk & gold", slug: "festive", image: U("1610047614301-13c63f00c032") },
  { n: "06", title: "Everyday", sub: "Polished daily companions", slug: "everyday", image: U("1758171692659-024183c2c272") },
];

const INSTA = [
  "1742626181963-1244929d2fdb",
  "1600685890506-593fdf55949b",
  "1681747685985-a401c271156c",
  "1790891819681-48168ab22b4e",
  "1584917865442-de89df76afd3",
  "1768767115625-69d3c41f7bb1",
];

export default async function Home() {
  const [featured, fresh, categories, reviews, all] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getProducts({ sort: "new", limit: 8 }),
    getCategories(),
    getLatestReviews(3),
    getProducts(),
  ]);
  const hero = featured[0];

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="grain relative overflow-hidden bg-ink text-ivory">
        <div className="pointer-events-none absolute -right-40 top-20 h-[640px] w-[640px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="container-lux relative grid min-h-[100svh] items-center gap-12 pb-12 pt-32 lg:grid-cols-[1.1fr_1fr] lg:pt-28">
          <div className="animate-fade-up">
            <p className="eyebrow text-gold-soft">The Occasion Edit · Wedding Season 2026</p>
            <h1 className="h-display mt-7 text-[clamp(56px,8.6vw,144px)]">
              Carry the
              <span className="block font-serif italic text-gold-soft">moment.</span>
            </h1>
            <p className="mt-8 max-w-md text-[16px] leading-relaxed text-ivory/70">
              Hand-finished clutches, potlis and handbags for every mehendi, sangeet, reception and the
              hundred little celebrations between — designed in Surat, delivered across India.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="btn-gold">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?occasion=wedding" className="btn-line-light">
                The wedding edit
              </Link>
            </div>
            <div className="mt-14 flex items-center gap-8 text-ivory/60">
              <div>
                <p className="font-display text-3xl text-ivory">21.8K+</p>
                <p className="text-[11px] uppercase tracking-[0.2em]">Instagram family</p>
              </div>
              <span className="h-10 w-px bg-ivory/15" />
              <div>
                <p className="font-display text-3xl text-ivory">Pan-India</p>
                <p className="text-[11px] uppercase tracking-[0.2em]">COD available</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto h-[560px] w-full max-w-[520px] lg:h-[680px]">
            <div className="absolute right-0 top-0 h-[88%] w-[74%] overflow-hidden rounded-t-full border border-gold/30 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1600685890506-593fdf55949b"), 1100)} alt="Bride carrying an Aurica potli" className="h-full w-full rounded-t-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 h-[46%] w-[46%] overflow-hidden rounded-t-full border-[6px] border-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1742626181963-1244929d2fdb"), 700)} alt="Crystal clutch" className="h-full w-full object-cover" />
            </div>
            {hero && (
              <Link
                href={`/product/${hero.slug}`}
                className="absolute bottom-10 right-4 flex items-center gap-4 rounded-2xl bg-ivory/95 p-3 pr-5 text-ink shadow-2xl backdrop-blur transition hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(hero.images[0], 200)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Bestseller</p>
                  <p className="font-display text-[16px] leading-tight">{hero.name}</p>
                  <p className="text-sm">{inr(hero.price)}</p>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            <span className="absolute -left-2 top-16 hidden rotate-[-90deg] text-[10px] uppercase tracking-[0.5em] text-ivory/40 lg:block">
              Est. Surat
            </span>
          </div>
        </div>

        <div className="container-lux relative grid border-t border-ivory/10 sm:grid-cols-3">
          {OCCASIONS.slice(0, 3).map((o) => (
            <Link key={o.slug} href={`/shop?occasion=${o.slug}`} className="group flex items-center justify-between gap-4 border-ivory/10 py-6 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/50">{o.n} · {o.sub}</p>
                <p className="mt-1 font-display text-2xl">{o.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <div className="overflow-hidden border-b border-line bg-cream py-5">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-[22px] text-ink/80">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Handcrafted in Surat", "Single piece & wholesale", "Cash on delivery", "Free shipping above ₹1,999", "Easy 7-day exchange", "Made for every celebration"].map((t) => (
              <span key={t + k} className="flex items-center gap-12">
                {t} <span className="text-gold">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      {/* ───────────── SHOP BY OCCASION ───────────── */}
      <section className="py-24 lg:py-32">
        <div className="container-lux">
          <Reveal className="grid items-end gap-6 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Shop by occasion</p>
              <h2 className="h-display mt-5 text-[clamp(40px,5vw,72px)]">
                One bag for every <span className="font-serif italic text-gold-deep">ceremony.</span>
              </h2>
            </div>
            <p className="max-w-md text-muted lg:justify-self-end">
              From the first haldi morning to the last reception dance — each edit is styled for the outfits,
              lights and moments of that day.
            </p>
          </Reveal>
        </div>
        <div className="no-scrollbar mt-14 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:px-8 lg:px-12">
          {OCCASIONS.map((o, i) => (
            <Reveal key={o.slug} delay={i * 80} className="shrink-0 snap-start">
              <Link href={`/shop?occasion=${o.slug}`} className="group block w-[72vw] sm:w-[340px]">
                <div className="relative aspect-[3/4.3] overflow-hidden rounded-t-full bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(o.image, 700)} alt={o.title} loading="lazy" className="zoom-img h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                    <p className="text-[11px] tracking-[0.3em] text-gold-soft">{o.n}</p>
                    <p className="mt-1 font-display text-[28px] leading-tight">{o.title}</p>
                    <p className="mt-1 text-sm text-ivory/70">{o.sub}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── THE EDIT ───────────── */}
      <section className="bg-cream/60 py-24 lg:py-32">
        <div className="container-lux grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="group relative aspect-[4/5.4] overflow-hidden rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(U("1610047614301-13c63f00c032"), 1000)} alt="The Aurica edit" className="zoom-img h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-ivory sm:p-10">
                  <p className="eyebrow text-gold-soft">The Aurica Edit</p>
                  <p className="h-display mt-4 text-[44px] sm:text-[54px]">
                    Most-loved,<br />
                    <span className="font-serif italic">most-gifted.</span>
                  </p>
                  <Link href="/shop?sort=featured" className="link-arrow mt-7 text-ivory">
                    Shop bestsellers <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:col-span-7">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 90} className={i % 2 === 1 ? "lg:mt-20" : ""}>
                <ProductCard p={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── STORY ───────────── */}
      <section className="py-24 lg:py-36">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative order-2 h-[520px] lg:order-1 lg:h-[640px]">
            <div className="absolute left-0 top-0 h-[78%] w-[64%] overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1713425885188-f1daa057691f"), 900)} alt="Zari fabric" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 h-[62%] w-[52%] overflow-hidden rounded-t-full border-[10px] border-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1784450691236-d970d91b58a9"), 700)} alt="Gold potli and heels" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-8 left-6 flex h-32 w-32 items-center justify-center rounded-full bg-ink text-center text-ivory">
              <p className="font-serif text-lg italic leading-tight">
                Made in<br />
                <span className="font-display not-italic tracking-[0.2em]">SURAT</span>
              </p>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={120}>
            <p className="eyebrow">Our story</p>
            <h2 className="h-display mt-5 text-[clamp(38px,4.6vw,64px)]">
              Surat&apos;s textile heritage,<br />
              <span className="font-serif italic text-gold-deep">held in your hand.</span>
            </h2>
            <p className="mt-8 max-w-lg text-[16px] leading-relaxed text-muted">
              Aurica began as a small studio in Adajan with one belief — that the bag you carry to a celebration
              should feel as special as the outfit you wear. Every piece is finished by hand: zari stitched,
              crystals set, linings checked, so that it photographs beautifully and lasts long after the
              last baraat.
            </p>
            <div className="mt-12 grid max-w-lg grid-cols-3 border-t border-line pt-8">
              {[
                ["500+", "Designs a season"],
                ["4.8★", "Average rating"],
                ["7-day", "Easy exchange"],
              ].map(([a, b]) => (
                <div key={b}>
                  <p className="font-display text-3xl">{a}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{b}</p>
                </div>
              ))}
            </div>
            <Link href="/about" className="link-arrow mt-12">
              More about Aurica <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      <section className="pb-24 lg:pb-32">
        <div className="container-lux">
          <Reveal className="flex items-end justify-between gap-6">
            <h2 className="h-display text-[clamp(36px,4vw,56px)]">Explore the house</h2>
            <Link href="/shop" className="link-arrow hidden sm:inline-flex">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c, i) => {
              const count = all.filter((p) => p.category_id === c.id).length;
              return (
                <Reveal key={c.id} delay={i * 60}>
                  <Link href={`/shop?category=${c.slug}`} className="group block text-center">
                    <div className={`overflow-hidden bg-cream ${i % 2 ? "rounded-[24px]" : "rounded-t-full"} aspect-[3/4]`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img(c.image_url, 600)} alt={c.name} loading="lazy" className="zoom-img h-full w-full object-cover" />
                    </div>
                    <p className="mt-4 font-display text-[19px]">{c.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{count} pieces</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── NEW ARRIVALS ───────────── */}
      <section className="border-t border-line py-24 lg:py-32">
        <div className="container-lux flex items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow">Just landed</p>
            <h2 className="h-display mt-4 text-[clamp(36px,4vw,56px)]">New arrivals</h2>
          </Reveal>
          <Link href="/shop?sort=new" className="link-arrow">
            Shop new <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="no-scrollbar mt-12 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:px-8 lg:px-12">
          {fresh.map((p) => (
            <div key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-[300px]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── WHOLESALE BAND ───────────── */}
      <section className="container-lux pb-24 lg:pb-32">
        <Reveal className="grain relative overflow-hidden rounded-[32px] bg-ink px-8 py-16 text-ivory sm:px-14 lg:py-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(U("1774141818089-d211d5bd01f9"), 1400)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow text-gold-soft">Single piece & wholesale</p>
              <h2 className="h-display mt-5 text-[clamp(36px,4.6vw,66px)]">
                Dressing a bridal party<br />
                or stocking a <span className="font-serif italic text-gold-soft">boutique?</span>
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-sm text-ivory/70">
                Bulk pricing from 10 pieces, custom colours for wedding trousseaus and return gifting, and
                dispatch within 72 hours.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/wholesale" className="btn-gold">Wholesale enquiry</Link>
                <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="btn-line-light">
                  WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────── REVIEWS ───────────── */}
      {reviews.length > 0 && (
        <section className="bg-cream/60 py-24 lg:py-32">
          <div className="container-lux">
            <Reveal className="text-center">
              <p className="eyebrow">Kind words</p>
              <h2 className="h-display mt-4 text-[clamp(36px,4vw,56px)]">
                Carried, <span className="font-serif italic text-gold-deep">and cherished.</span>
              </h2>
            </Reveal>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 100} className="flex flex-col rounded-[24px] bg-ivory p-8 lg:p-10">
                  <div className="flex gap-0.5 text-gold">
                    {Array.from({ length: r.rating }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-6 font-serif text-[24px] leading-snug italic">“{r.title}”</p>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">{r.body}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-line pt-5 text-sm">
                    <span className="font-medium">{r.author_name}</span>
                    {r.product && (
                      <Link href={`/product/${r.product.slug}`} className="text-muted underline-offset-4 hover:underline">
                        {r.product.name}
                      </Link>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── INSTAGRAM ───────────── */}
      <section className="py-24">
        <div className="container-lux">
          <div className="flex flex-col items-center text-center">
            <Instagram className="h-6 w-6 text-gold" strokeWidth={1.4} />
            <a href={SITE.instagram} target="_blank" rel="noreferrer" className="mt-4 font-display text-3xl hover:text-gold-deep">
              @aurica_bags
            </a>
            <p className="mt-2 text-sm text-muted">Tag us to be featured — styled by our community of 21.8K.</p>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6">
            {INSTA.map((id) => (
              <a key={id} href={SITE.instagram} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(U(id), 500)} alt="Aurica on Instagram" loading="lazy" className="zoom-img h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-ivory opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
                  <Instagram className="h-6 w-6" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
