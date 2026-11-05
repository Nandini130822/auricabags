import Link from "next/link";
import { StatusPill } from "@/components/OrderBits";
import { getMyOrders } from "@/lib/data";
import { date, img, inr, label } from "@/lib/format";

export const metadata = { title: "My orders" };

export default async function MyOrders() {
  const orders = await getMyOrders();
  if (!orders.length)
    return (
      <div className="rounded-[24px] bg-cream/60 p-12 text-center">
        <p className="font-serif text-3xl italic">No orders yet.</p>
        <Link href="/shop" className="btn-dark mt-6">Discover the collection</Link>
      </div>
    );
  return (
    <div className="space-y-5">
      {orders.map((o) => (
        <Link key={o.id} href={`/account/orders/${o.id}`} className="block rounded-[22px] border border-line p-5 transition hover:border-ink/40 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl">{o.order_number}</p>
              <p className="text-sm text-muted">Placed {date(o.created_at)} · {label(o.payment_method)}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusPill status={o.status} />
              <span className="font-medium">{inr(o.total)}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-3 overflow-hidden">
            {o.order_items?.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl bg-cream/60 p-2 pr-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(i.image, 120)} alt="" className="h-12 w-10 rounded-lg object-cover" />
                <span className="text-sm">{i.name}</span>
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
