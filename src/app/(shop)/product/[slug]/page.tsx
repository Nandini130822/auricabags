import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductBuy } from "@/components/ProductBuy";
import { ProductGallery } from "@/components/ProductGallery";
import { ReviewForm } from "@/components/ReviewForm";
import { getProduct, getProductReviews, getProducts, getSessionUser } from "@/lib/data";
import { date, img } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.description ?? undefined, openGraph: { images: [img(p.images[0], 1200)] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [reviews, related, user] = await Promise.all([
    getProductReviews(p.id),
    getProducts({ category: p.category?.slug, limit: 5 }),
    getSessionUser(),
  ]);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <section className="container-lux grid gap-10 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-12">
        <ProductGallery images={p.images} name={p.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">
            <Link href="/shop">Shop</Link>
            {p.category && (
              <>
                {" / "}
                <Link href={`/shop?category=${p.category.slug}`}>{p.category.name}</Link>
              </>
            )}
          </p>
          <h1 className="h-display mt-5 text-[clamp(38px,4.4vw,60px)]">{p.name}</h1>
          {reviews.length > 0 && (
            <a href="#reviews" className="mt-4 flex items-center gap-2 text-sm text-muted">
              <span className="flex text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avg) ? "fill-current" : ""}`} />
                ))}
              </span>
              {avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
            </a>
          )}

          <ProductBuy product={p} />

          <div className="mt-10 divide-y divide-line border-y border-line">
            {[
              ["The details", p.description],
              [
                "Material & size",
                [p.material, p.dimensions && `Dimensions: ${p.dimensions}`, p.sku && `SKU: ${p.sku}`].filter(Boolean).join("\n"),
              ],
              ["Made for", p.occasions.join(" · ")],
              [
                "Shipping & exchange",
                "Dispatched from Surat within 24–48 hours. Free shipping above ₹1,999. Cash on delivery available. Easy 7-day exchange on unused pieces with tags.",
              ],
              ["Caring for your bag", "Store in the dust bag provided, away from moisture and perfume. Wipe gently with a dry cloth; avoid folding embellished panels."],
            ].map(([t, body], i) => (
              <details key={t} open={i === 0} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] uppercase tracking-[0.2em]">
                  {t}
                  <span className="text-lg leading-none transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted">{body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="border-t border-line bg-cream/50 py-20">
        <div className="container-lux grid gap-14 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Reviews</p>
            <p className="h-display mt-4 text-6xl">{reviews.length ? avg.toFixed(1) : "—"}</p>
            <p className="mt-2 text-muted">
              {reviews.length ? `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "Be the first to review this piece."}
            </p>
            <ReviewForm productId={p.id} signedIn={Boolean(user)} />
          </div>
          <div className="divide-y divide-line">
            {reviews.length === 0 && <p className="py-6 font-serif text-2xl italic text-muted">No reviews yet.</p>}
            {reviews.map((r) => (
              <article key={r.id} className="py-7 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="flex text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-current" : ""}`} />
                    ))}
                  </span>
                  <span className="text-xs text-muted">{date(r.created_at)}</span>
                </div>
                {r.title && <p className="mt-3 font-display text-xl">{r.title}</p>}
                {r.body && <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.body}</p>}
                <p className="mt-3 text-[12px] uppercase tracking-[0.18em]">{r.author_name} · Verified buyer</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {related.filter((r) => r.id !== p.id).length > 0 && (
        <section className="container-lux py-24">
          <h2 className="h-display text-[clamp(32px,3.6vw,48px)]">
            You may also <span className="font-serif italic text-gold-deep">adore</span>
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related
              .filter((r) => r.id !== p.id)
              .slice(0, 4)
              .map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
          </div>
        </section>
      )}
    </>
  );
}
