import Link from "next/link";
import { AlertTriangle, IndianRupee, MessageSquareText, Receipt, ShoppingBag, Users, Clock } from "lucide-react";
import { Card, Kpi, PageHeader, Pill, Table, Td } from "@/components/admin/ui";
import { adminOverview } from "@/lib/admin-data";
import { date, img, inr } from "@/lib/format";

export default async function AdminOverview() {
  const d = await adminOverview();
  const max = Math.max(1, ...d.days.map((x) => x.total));
  const twoWeek = d.days.reduce((s, x) => s + x.total, 0);

  return (
    <>
      <PageHeader title="Overview" sub="A quick look at how Aurica is doing." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Revenue" value={inr(d.revenue)} hint="from paid orders" icon={<IndianRupee size={16} />} />
        <Kpi label="Orders" value={String(d.orderCount)} hint="all time" icon={<ShoppingBag size={16} />} />
        <Kpi label="Avg. order" value={inr(d.aov)} icon={<Receipt size={16} />} />
        <Kpi label="Customers" value={String(d.customers)} icon={<Users size={16} />} />
        <Kpi label="To fulfil" value={String(d.pendingOrders)} hint="pending · confirmed · packed" icon={<Clock size={16} />} />
        <Kpi label="Low stock" value={String(d.lowStock.length)} hint="5 or fewer left" icon={<AlertTriangle size={16} />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="Sales — last 14 days" className="xl:col-span-2" action={<span className="text-sm text-muted">{inr(twoWeek)}</span>}>
          <div className="flex h-48 items-end gap-1.5 sm:gap-2.5">
            {d.days.map((x) => (
              <div key={x.date.toISOString()} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] text-muted opacity-0 transition group-hover:opacity-100">{x.total ? inr(x.total) : ""}</span>
                <div
                  className="w-full rounded-t-md bg-gold/80 transition group-hover:bg-gold-deep"
                  style={{ height: `${Math.max(2, (x.total / max) * 100)}%`, opacity: x.total ? 1 : 0.25 }}
                />
                <span className="text-[10px] text-muted">{x.date.getDate()}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card title="Low stock" action={<Link href="/admin/products" className="text-xs underline">Manage</Link>}>
            {d.lowStock.length === 0 ? (
              <p className="text-sm text-muted">All products are well stocked.</p>
            ) : (
              <ul className="space-y-3">
                {d.lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(p.images[0], 120)} alt="" className="size-10 rounded-lg object-cover" />
                    <Link href={`/admin/products/${p.id}`} className="flex-1 truncate text-sm hover:underline">
                      {p.name}
                    </Link>
                    <span className={`text-sm font-medium ${p.stock === 0 ? "text-rose-700" : "text-amber-700"}`}>{p.stock} left</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Link href="/admin/reviews" className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 hover:border-gold">
            <MessageSquareText className="text-gold" size={22} strokeWidth={1.5} />
            <div className="flex-1">
              <div className="font-display text-xl">{d.pendingReviews}</div>
              <div className="text-xs text-muted">reviews waiting for approval</div>
            </div>
            <span className="text-xs underline">Review</span>
          </Link>
        </div>
      </div>

      <Card title="Recent orders" className="mt-4" action={<Link href="/admin/orders" className="text-xs underline">All orders</Link>}>
        <Table head={["Order", "Customer", "Date", "Total", "Payment", "Status"]} empty={!d.recent.length}>
          {d.recent.map((o) => (
            <tr key={o.id} className="hover:bg-ivory/60">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                  #{o.order_number}
                </Link>
              </Td>
              <Td>{o.customer_name}</Td>
              <Td className="text-muted">{date(o.created_at)}</Td>
              <Td>{inr(o.total)}</Td>
              <Td>
                <Pill value={o.payment_status} />
              </Td>
              <Td>
                <Pill value={o.status} />
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
