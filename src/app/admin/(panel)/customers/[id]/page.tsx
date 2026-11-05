import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { setRole, toggleBlock } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/client";
import { Card, Kpi, PageHeader, Pill, Table, Td, btnDanger, btnLine } from "@/components/admin/ui";
import { adminCustomer } from "@/lib/admin-data";
import { date, inr } from "@/lib/format";

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await adminCustomer(id);
  if (!data) notFound();
  const { customer: c, orders } = data;
  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Customers
      </Link>
      <PageHeader
        title={c.full_name || c.email || "Customer"}
        sub={`${c.email ?? ""} ${c.phone ? "· " + c.phone : ""} · joined ${date(c.created_at)}`}
        action={
          <div className="flex gap-2">
            <ActionButton
              action={setRole.bind(null, c.id, c.role === "admin" ? "customer" : "admin")}
              confirmText={c.role === "admin" ? "Remove admin access?" : "Give this person full admin access?"}
              className={btnLine}
            >
              {c.role === "admin" ? "Remove admin" : "Make admin"}
            </ActionButton>
            <ActionButton action={toggleBlock.bind(null, c.id)} className={c.is_blocked ? btnLine : btnDanger}>
              {c.is_blocked ? "Unblock" : "Block"}
            </ActionButton>
          </div>
        }
      />
      <div className="mb-4 flex gap-2">
        <Pill value={c.role} />
        {c.is_blocked && <Pill value="blocked" />}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Orders" value={String(c.orders)} />
        <Kpi label="Total spent" value={inr(c.spent)} />
        <Kpi label="Avg. order" value={inr(c.orders ? Math.round(c.spent / Math.max(1, orders.filter((o) => o.payment_status === "paid").length)) : 0)} />
      </div>
      <Card title="Order history">
        <Table head={["Order", "Date", "Total", "Payment", "Status"]} empty={!orders.length}>
          {orders.map((o) => (
            <tr key={o.id}>
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                  #{o.order_number}
                </Link>
              </Td>
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
