import { WholesaleForm } from "@/components/WholesaleForm";
import { img } from "@/lib/format";

export const metadata = { title: "Wholesale & bulk orders" };

const PERKS = [
  ["01", "Tiered pricing", "Better rates from 10, 25 and 50 pieces — mix designs and colours freely."],
  ["02", "Custom colours", "Match a bridal palette or a brand — custom dyes and tassels from 25 pieces."],
  ["03", "Gift-ready packing", "Dust bags, tags and boxed packing for return gifts and trousseaus."],
  ["04", "72-hour dispatch", "Ready stock ships from Surat in three days, anywhere in India."],
];

export default function Wholesale() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-ink text-ivory">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("https://images.unsplash.com/photo-1713425885188-f1daa057691f", 1600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="container-lux relative py-28 lg:py-40">
          <p className="eyebrow text-gold-soft">Single piece & wholesale</p>
          <h1 className="h-display mt-6 max-w-4xl text-[clamp(48px,7vw,110px)]">
            Bulk orders, <span className="font-serif italic text-gold-soft">boutique finish.</span>
          </h1>
          <p className="mt-6 max-w-lg text-ivory/70">For boutiques, wedding planners, bridal parties and corporate gifting.</p>
        </div>
      </section>
      <section className="container-lux grid gap-16 py-24 lg:grid-cols-2">
        <div className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2">
          {PERKS.map(([n, t, d]) => (
            <div key={n} className="bg-ivory p-8">
              <p className="text-sm text-gold-deep">{n}</p>
              <p className="mt-6 font-display text-2xl">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
        <WholesaleForm />
      </section>
    </>
  );
}
