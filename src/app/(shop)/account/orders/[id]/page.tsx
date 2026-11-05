import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrderProgress, StatusPill, TrackingTimeline } from "@/components/OrderBits";
import { getMyOrder } from "@/lib/data";
import { dateTime, img, inr, label } from "@/lib/format";

export default async function MyOrder({ params }: { params: Promise<{ id: string }> }) {
  const o = await getMyOrder((await params).id);
  if (!o) notFound();
  const a = o.shipping_address;
  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Order {o.order_number}</h2>
          <p className="text-sm text-muted">Placed {dateTime(o.created_at)}</p>
        </div>
        <StatusPill status={o.status} />
      </div>

      <div className="rounded-[24px] border border-line p-6 sm:p-8">
        <OrderProgress order={o} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-cream/60 p-6 sm:p-8">
          <p className="eyebrow">Tracking</p>
          <div className="mt-5"><TrackingTimeline order={o} /></div>
        </div>
        <div className="rounded-[24px] bg-cream/60 p-6 sm:p-8">
          <p className="eyebrow">Delivering to</p>
          <p className="mt-4 font-medium">{a.full_name}</p>
          <p className="text-sm leading-relaxed text-muted">
            {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}
          </p>
          <p className="eyebrow mt-6">Payment</p>
          <p className="mt-2 text-sm">{label(o.payment_method)} · <span className="text-muted">{label(o.payment_status)}</span></p>
        </div>
      </div>

      <div className="rounded-[24px] border border-line p-6 sm:p-8">
        <ul className="divide-y divide-line">
          {o.order_items?.map((i) => (
            <li key={i.id} className="flex items-center gap-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(i.image, 160)} alt="" className="h-20 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-display text-lg">{i.name}</p>
                <p className="text-sm text-muted">{i.color} · Qty {i.quantity}</p>
              </div>
              <p>{inr(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
          {Number(o.discount) > 0 && <div className="flex justify-between text-gold-deep"><dt>Discount {o.coupon_code && `(${o.coupon_code})`}</dt><dd>−{inr(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{Number(o.shipping_fee) ? inr(o.shipping_fee) : "Free"}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
