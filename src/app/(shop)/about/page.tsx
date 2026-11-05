import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Clasp } from "@/components/Clasp";
import { Reveal } from "@/components/Reveal";
import { img } from "@/lib/format";

export const metadata = { title: "Our story" };
const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

export default function About() {
  return (
    <>
      <section className="container-lux py-20 lg:py-28">
        <p className="eyebrow">Our story</p>
        <h1 className="h-display mt-6 max-w-5xl text-[clamp(48px,7.4vw,120px)]">
          Small studio. <span className="font-serif italic text-gold-deep">Big celebrations.</span>
        </h1>
      </section>
      <section className="container-lux grid gap-6 pb-20 md:grid-cols-12">
        <Clasp size="lg" className="flex flex-col md:col-span-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="min-h-0 flex-1 overflow-hidden bg-sand"><img src={img(U("1787284461013-e58abaed4f78"), 1200)} alt="" className="h-full w-full object-cover" /></div>
        </Clasp>
        <Clasp size="lg" className="flex flex-col md:col-span-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="min-h-0 flex-1 overflow-hidden bg-sand"><img src={img(U("1784450691236-d970d91b58a9"), 800)} alt="" className="h-full w-full object-cover" /></div>
        </Clasp>
      </section>
      <section className="container-lux grid gap-16 pb-28 lg:grid-cols-2">
        <Reveal>
          <p className="font-serif text-[34px] leading-snug italic">
            “We wanted every woman in Surat — and then across India — to walk into a celebration holding something
            that looks like it came from a couture house, at a price that makes sense.”
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted">— Founder, Aurica Bags</p>
        </Reveal>
        <Reveal delay={120} className="space-y-6 text-[16px] leading-relaxed text-muted">
          <p>
            Aurica started in Adajan, Surat — a city that has dressed India in silk and zari for centuries. We
            work with local karigars and finishing studios to make clutches, potlis and handbags that carry that
            heritage into today&apos;s weddings, receptions and parties.
          </p>
          <p>
            Every design is sampled, worn and photographed before it reaches you. We sell single pieces to
            brides and guests, and in volume to boutiques, wedding planners and gifting studios.
          </p>
          <div className="grid grid-cols-3 border-t border-line pt-8 text-ink">
            {[["21.8K", "Community"], ["Pan-India", "Shipping"], ["Single + Bulk", "Orders"]].map(([a, b]) => (
              <div key={b}><p className="font-display text-2xl">{a}</p><p className="text-[11px] uppercase tracking-[0.18em] text-muted">{b}</p></div>
            ))}
          </div>
          <Link href="/shop" className="link-arrow text-ink">Shop the collection <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Reveal>
      </section>
    </>
  );
}
