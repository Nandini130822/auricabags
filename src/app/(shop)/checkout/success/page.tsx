import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getOrderForReceipt } from "@/app/actions/shop";
import { img, inr, label } from "@/lib/format";

export const metadata = { title: "Thank you" };

export default async function Success({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  if (!id) notFound();
  const o = await getOrderForReceipt(id);
  if (!o) notFound();
  return (
    <section className="container-lux max-w-3xl py-20 text-center lg:py-28">
      <CheckCircle2 className="mx-auto h-12 w-12 text-gold" strokeWidth={1.2} />
      <p className="eyebrow mt-6">Order {o.order_number}</p>
      <h1 className="h-display mt-4 text-[clamp(44px,6vw,80px)]">
        Thank you, <span className="font-serif italic text-gold-deep">{o.customer_name.split(" ")[0]}.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-muted">
        We&apos;ve received your order and sent a confirmation to {o.email}. Your piece will be hand-checked and
        dispatched from Surat within 48 hours.
      </p>
      <div className="mt-12 rounded-[28px] bg-cream/70 p-8 text-left">
        <ul className="divide-y divide-line">
          {o.order_items?.map((i) => (
            <li key={i.id} className="flex items-center gap-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(i.image, 160)} alt="" className="h-16 w-14 rounded-xl object-cover" />
              <span className="flex-1">
                <span className="block font-display">{i.name}</span>
                <span className="text-sm text-muted">{i.color} · Qty {i.quantity}</span>
              </span>
              <span>{inr(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="text-muted">Paid via {label(o.payment_method)} · {label(o.payment_status)}</span>
          <span className="font-medium">{inr(o.total)}</span>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className="btn-dark">Track my order</Link>
        <Link href="/shop" className="btn-line">Continue shopping</Link>
      </div>
    </section>
  );
}
