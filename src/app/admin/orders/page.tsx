import Link from "next/link";
import { Search } from "lucide-react";
import { Card, PageHeader, Pill, Table, Tabs, Td, input } from "@/components/admin/ui";
import { adminOrders } from "@/lib/admin-data";
import { ORDER_STATUSES } from "@/lib/config";
import { dateTime, inr, label } from "@/lib/format";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const all = await adminOrders();
  const s = q.toLowerCase().replace("#", "");
  const list = all.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (!s || o.order_number.toLowerCase().includes(s) || o.customer_name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s)),
  );
  const href = (st: string) => `/admin/orders?status=${st}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <PageHeader title="Orders" sub={`${all.length} orders in total`} />
      <Tabs
        active={status}
        items={[
          { key: "all", label: "All", href: href("all"), count: all.length },
          ...ORDER_STATUSES.map((st) => ({ key: st, label: label(st), href: href(st), count: all.filter((o) => o.status === st).length })),
        ]}
      />
      <Card>
        <form className="relative mb-4 max-w-sm">
          <input type="hidden" name="status" value={status} />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search order #, name or email" className={`${input} pl-9`} />
        </form>
        <Table head={["Order", "Customer", "Placed", "Items", "Total", "Method", "Payment", "Status"]} empty={!list.length}>
          {list.map((o) => (
            <tr key={o.id} className="hover:bg-ivory/60">
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                  #{o.order_number}
                </Link>
              </Td>
              <Td>
                <div>{o.customer_name}</div>
                <div className="text-xs text-muted">{o.shipping_address.city}</div>
              </Td>
              <Td className="text-muted">{dateTime(o.created_at)}</Td>
              <Td>{o.order_items?.reduce((n, i) => n + i.quantity, 0) ?? 0}</Td>
              <Td className="font-medium">{inr(o.total)}</Td>
              <Td className="uppercase text-xs text-muted">{o.payment_method}</Td>
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
