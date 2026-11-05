import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderProgress, StatusPill } from "@/components/OrderBits";
import { getMyOrders, getMyWishlist } from "@/lib/data";
import { date, img, inr } from "@/lib/format";

export default async function AccountHome() {
  const [orders, wishlist] = await Promise.all([getMyOrders(), getMyWishlist()]);
  const active = orders.find((o) => !["delivered", "cancelled", "returned", "pending"].includes(o.status));
  const spent = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Orders", orders.length],
          ["Wishlist", wishlist.length],
          ["Total spent", inr(spent)],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-[22px] bg-cream/70 p-6">
            <p className="eyebrow">{k}</p>
            <p className="mt-3 font-display text-4xl">{v}</p>
          </div>
        ))}
      </div>

      {active && (
        <div className="rounded-[24px] border border-line p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">On its way</p>
              <p className="mt-2 font-display text-2xl">Order {active.order_number}</p>
            </div>
            <Link href={`/account/orders/${active.id}`} className="link-arrow">Track <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-8"><OrderProgress order={active} /></div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-muted underline-offset-4 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <div className="mt-6 rounded-[24px] bg-cream/60 p-10 text-center">
            <p className="font-serif text-2xl italic">No orders yet.</p>
            <Link href="/shop" className="btn-dark mt-6">Start shopping</Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 py-5 hover:bg-cream/40">
                  <div className="flex -space-x-3">
                    {o.order_items?.slice(0, 3).map((i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i.id} src={img(i.image, 120)} alt="" className="h-14 w-12 rounded-lg border-2 border-ivory object-cover" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-sm text-muted">{date(o.created_at)} · {o.order_items?.length} item(s)</p>
                  </div>
                  <StatusPill status={o.status} />
                  <p className="hidden w-24 text-right sm:block">{inr(o.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
