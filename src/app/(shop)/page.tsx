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
  { n: "01", title: "The Wedding", sub: "Potlis & bridal clutches", slug: "wedding", image: "/images/products/gold-zari-flower-bag.webp" },
  { n: "02", title: "Reception Night", sub: "Crystal & satin minaudières", slug: "reception", image: "/images/products/pearl-frame-clutch.webp" },
  { n: "03", title: "Sangeet & Mehendi", sub: "Colour, beads & tassels", slug: "sangeet", image: U("1767771322982-8041f4a5da8e") },
  { n: "04", title: "Cocktail & Party", sub: "Metallics after dark", slug: "party", image: "/images/products/black-sequin-clutch.webp" },
  { n: "05", title: "Festive", sub: "Zari, silk & gold", slug: "festive", image: U("1759064716592-3963a0881ff8") },
  { n: "06", title: "Everyday", sub: "Polished daily companions", slug: "everyday", image: U("1598532163257-ae3c6b2524b6") },
];

const INSTA = [
  "1742626181963-1244929d2fdb",
  "1759064716592-3963a0881ff8",
  "1681747685985-a401c271156c",
  "1598552105309-9243044d2002",
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
      <section className="relative overflow-hidden bg-ivory">
        {/* soft sand panel behind the image composition */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] rounded-bl-[200px] bg-cream lg:block" />
        <div className="pointer-events-none absolute right-[18%] top-24 hidden h-72 w-72 rounded-full bg-gold-soft/30 blur-[90px] lg:block" />

        <div className="container-lux relative grid items-center gap-14 pb-16 pt-10 lg:min-h-[calc(100svh-112px)] lg:grid-cols-[1.05fr_1fr] lg:pb-10 lg:pt-6">
          <div className="animate-fade-up">
            <p className="eyebrow flex items-center gap-3 text-gold-deep">
              <span className="h-px w-10 bg-gold" /> Clutches · Potlis · Handbags
            </p>
            <h1 className="h-display mt-7 text-[clamp(54px,8vw,132px)] text-ink">
              Carry the
              <span className="block font-serif italic text-gold-deep">moment.</span>
            </h1>
            <p className="mt-7 max-w-md text-[16px] leading-relaxed text-muted">
              Hand-finished statement bags for weddings, receptions, parties and every celebration in between —
              designed in Surat, delivered across India.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="btn-dark">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?sort=new" className="btn-line">
                New arrivals
              </Link>
            </div>
            <div className="mt-14 grid max-w-md grid-cols-3 border-t border-line pt-7">
              {[
                ["21.8K+", "Happy followers"],
                ["COD", "Pan-India"],
                ["7-day", "Easy exchange"],
              ].map(([a, b]) => (
                <div key={b}>
                  <p className="font-display text-[28px] leading-none">{a}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[540px] sm:h-[600px] lg:h-[660px]">
            {/* gold outline arch, offset behind the main image */}
            <div className="absolute right-[2%] top-[2%] h-[86%] w-[68%] rounded-t-full border border-gold/50" />
            <div className="absolute right-[7%] top-[6%] h-[86%] w-[68%] overflow-hidden rounded-t-full bg-sand shadow-[0_30px_80px_-30px_rgba(28,26,23,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1787284461013-e58abaed4f78"), 1100)} alt="Embroidered Aurica frame bags" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[4%] left-0 h-[38%] w-[42%] overflow-hidden rounded-[28px] border-[6px] border-ivory bg-sand shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img("/images/products/pearl-frame-clutch.webp", 700)} alt="Pearl frame clutch" className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-[6%] top-[8%] flex h-24 w-24 items-center justify-center rounded-full bg-ink text-center text-ivory shadow-lg sm:h-28 sm:w-28">
              <p className="font-serif text-[15px] italic leading-tight">
                New<br />
                <span className="font-display text-[11px] not-italic tracking-[0.28em]">SEASON</span>
              </p>
            </div>
            {hero && (
              <Link
                href={`/product/${hero.slug}`}
                className="absolute bottom-[10%] right-0 flex items-center gap-4 rounded-2xl bg-white p-3 pr-5 text-ink shadow-2xl transition hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(hero.images[0], 200)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold-deep">Bestseller</p>
                  <p className="font-display text-[16px] leading-tight">{hero.name}</p>
                  <p className="text-sm">{inr(hero.price)}</p>
                </div>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="container-lux relative grid border-t border-line sm:grid-cols-3">
          {OCCASIONS.slice(0, 3).map((o) => (
            <Link key={o.slug} href={`/shop?occasion=${o.slug}`} className="group flex items-center justify-between gap-4 border-line py-6 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted">{o.n} · {o.sub}</p>
                <p className="mt-1 font-display text-2xl">{o.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gold-deep transition group-hover:translate-x-1" />
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
              <div className="group overflow-hidden rounded-[28px] bg-ivory shadow-[0_30px_80px_-40px_rgba(28,26,23,0.3)]">
                <div className="aspect-[4/3.6] overflow-hidden rounded-t-full bg-sand m-5 mb-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(U("1681747685985-a401c271156c"), 1000)} alt="The Aurica edit" className="zoom-img h-full w-full object-cover" />
                </div>
                <div className="p-8 sm:p-10">
                  <p className="eyebrow text-gold-deep">The Aurica Edit</p>
                  <p className="h-display mt-4 text-[42px] sm:text-[52px]">
                    Most-loved,<br />
                    <span className="font-serif italic text-gold-deep">most-gifted.</span>
                  </p>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
                    The pieces our customers reorder, gift and tag us in the most.
                  </p>
                  <Link href="/shop?sort=featured" className="link-arrow mt-7">
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
              <img src={img(U("1713425885188-f1daa057691f"), 900)} alt="Aurica purses" loading="lazy" className="h-full w-full object-cover" />
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
        <Reveal className="relative grid items-center gap-10 overflow-hidden rounded-[32px] border border-line bg-cream px-8 py-12 sm:px-14 lg:grid-cols-[1.3fr_1fr] lg:py-16">
          <div>
            <p className="eyebrow text-gold-deep">Single piece & wholesale</p>
            <h2 className="h-display mt-5 text-[clamp(36px,4.4vw,62px)]">
              Buying for a boutique<br />
              or a <span className="font-serif italic text-gold-deep">bridal party?</span>
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Bulk pricing from 10 pieces, custom colours for trousseaus and return gifting, and dispatch from
              Surat within 72 hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/wholesale" className="btn-dark">Wholesale enquiry</Link>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="btn-line">
                WhatsApp us
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-[340px] w-full max-w-[360px] lg:h-[420px]">
            <div className="absolute inset-0 translate-x-3 -translate-y-3 rounded-t-full border border-gold/50" />
            <div className="absolute inset-0 overflow-hidden rounded-t-full bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(U("1684407261522-48ad66a060e9"), 900)} alt="Aurica bags on boutique shelves" loading="lazy" className="h-full w-full object-cover" />
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
