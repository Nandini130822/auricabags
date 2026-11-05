import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Card, DemoNote, Kpi, PageHeader, Pill, Table, Td } from "@/components/admin/ui";
import { adminOrders, adminPayments, adminSettings } from "@/lib/admin-data";
import { dateTime, inr, label } from "@/lib/format";

export default async function Payments() {
  const [payments, orders, settings] = await Promise.all([adminPayments(), adminOrders(), adminSettings()]);
  const sum = (st: string) => payments.filter((p) => p.status === st).reduce((s, p) => s + p.amount, 0);
  const codPending = orders.filter((o) => o.payment_method === "cod" && o.payment_status === "pending" && o.status !== "cancelled");
  const methods = ["upi", "card", "netbanking", "cod"].map((m) => ({
    m,
    n: payments.filter((p) => p.method === m && p.status === "captured").length,
  }));
  const maxM = Math.max(1, ...methods.map((x) => x.n));
  const pm = settings.payment;

  return (
    <>
      <PageHeader title="Payments" sub="Every transaction through the payment gateway and cash on delivery." />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-ivory">
              <CreditCard size={20} strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg">{label(pm.provider)} payment gateway</h2>
                <Pill value={pm.mode === "test" ? "Test mode" : "Live"} tone={pm.mode === "test" ? "amber" : "green"} />
              </div>
              <p className="mt-1 text-sm text-muted">
                Key <span className="font-mono">{pm.key_id || "—"}</span> · Accepting{" "}
                {[pm.upi_enabled && "UPI", pm.card_enabled && "Cards", pm.netbanking_enabled && "Netbanking", pm.cod_enabled && "COD"]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <ol className="mt-4 grid gap-2 text-[13px] sm:grid-cols-4">
                {["Customer pays at checkout", "Gateway confirms payment", "Order auto-confirmed", "Settlement to bank (T+2)"].map((s, i) => (
                  <li key={s} className="rounded-lg bg-ivory px-3 py-2">
                    <span className="mr-1 text-gold-deep">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-4">
            <DemoNote>
              This is a <b>demo integration</b>: the checkout shows a Razorpay-style payment sheet and records a test transaction. To go live,
              add your Razorpay key &amp; secret as environment variables and switch the mode in Settings.
            </DemoNote>
          </div>
        </Card>
        <Card title="Paid via">
          <div className="space-y-3">
            {methods.map((x) => (
              <div key={x.m}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="uppercase">{x.m}</span>
                  <span className="text-muted">{x.n}</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-cream">
                  <div className="h-full rounded bg-gold" style={{ width: `${(x.n / maxM) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Captured" value={inr(sum("captured"))} />
        <Kpi label="Refunded" value={inr(sum("refunded"))} />
        <Kpi label="Failed attempts" value={String(payments.filter((p) => p.status === "failed").length)} />
        <Kpi label="COD to collect" value={inr(codPending.reduce((s, o) => s + o.total, 0))} hint={`${codPending.length} orders`} />
      </div>

      <Card title="Transactions">
        <Table head={["Payment ID", "Order", "Customer", "Method", "Amount", "Status", "Date"]} empty={!payments.length}>
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-ivory/60">
              <Td className="font-mono text-xs">{p.provider_payment_id}</Td>
              <Td>
                <Link href={`/admin/orders/${p.order_id}`} className="font-medium hover:underline">
                  #{p.order?.order_number}
                </Link>
              </Td>
              <Td>{p.order?.customer_name}</Td>
              <Td className="text-xs uppercase text-muted">{p.method}</Td>
              <Td className="font-medium">{inr(p.amount)}</Td>
              <Td>
                <Pill value={p.status} />
              </Td>
              <Td className="text-muted">{dateTime(p.created_at)}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
