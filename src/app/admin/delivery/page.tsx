import Link from "next/link";
import { Truck } from "lucide-react";
import { advanceShipment } from "@/app/actions/admin";
import { ActionButton, PincodeChecker } from "@/components/admin/client";
import { Card, DemoNote, Kpi, PageHeader, Pill, Table, Td, btnLine } from "@/components/admin/ui";
import { adminOrders, adminSettings, adminShipments } from "@/lib/admin-data";
import { date, inr, label } from "@/lib/format";

export default async function Delivery() {
  const [shipments, orders, settings] = await Promise.all([adminShipments(), adminOrders(), adminSettings()]);
  const d = settings.delivery;
  const toShip = orders.filter((o) => o.status === "confirmed" && !o.shipments?.length);
  const count = (st: string) => shipments.filter((s) => s.status === st).length;

  return (
    <>
      <PageHeader title="Delivery" sub="Shipments, couriers and tracking." />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-ivory">
              <Truck size={20} strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg">{label(d.provider)} shipping partner</h2>
                <Pill value={d.mode === "test" ? "Test mode" : "Live"} tone={d.mode === "test" ? "amber" : "green"} />
              </div>
              <p className="mt-1 text-sm text-muted">
                Pickup from {d.pickup_pincode} · Couriers: {d.couriers.join(", ")} · Free shipping above {inr(d.free_shipping_above)}, else{" "}
                {inr(d.flat_fee)}
              </p>
              <ol className="mt-4 grid gap-2 text-[13px] sm:grid-cols-4">
                {["Create shipment on order", "AWB & label generated", "Courier picks up", "Live tracking to customer"].map((s, i) => (
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
              <b>Demo integration</b>: rates, AWB numbers and tracking events are simulated. Use “Advance status” to play the role of the
              courier. With live Shiprocket credentials these come from the courier automatically.
            </DemoNote>
          </div>
        </Card>
        <Card title="Pincode serviceability">
          <PincodeChecker couriers={d.couriers} from={d.pickup_pincode} />
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ready to ship" value={String(toShip.length)} hint="confirmed, no shipment" />
        <Kpi label="In transit" value={String(count("created") + count("picked_up") + count("in_transit"))} />
        <Kpi label="Out for delivery" value={String(count("out_for_delivery"))} />
        <Kpi label="Delivered" value={String(count("delivered"))} />
      </div>

      {toShip.length > 0 && (
        <Card title="Ready to ship" className="mb-4">
          <div className="flex flex-wrap gap-2">
            {toShip.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className={btnLine}>
                #{o.order_number} · {o.shipping_address.city}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card title="Shipments">
        <Table head={["AWB", "Courier", "Order", "Destination", "ETA", "Status", ""]} empty={!shipments.length}>
          {shipments.map((s) => (
            <tr key={s.id} className="hover:bg-ivory/60">
              <Td className="font-mono text-xs">{s.awb}</Td>
              <Td>{s.courier}</Td>
              <Td>
                <Link href={`/admin/orders/${s.order_id}`} className="font-medium hover:underline">
                  #{s.order?.order_number}
                </Link>
                <div className="text-xs text-muted">{s.order?.customer_name}</div>
              </Td>
              <Td className="text-muted">
                {s.order?.shipping_address.city} {s.order?.shipping_address.pincode}
              </Td>
              <Td className="text-muted">{s.eta ? date(s.eta) : "—"}</Td>
              <Td>
                <Pill value={s.status} />
              </Td>
              <Td>
                {!["delivered", "rto"].includes(s.status) && (
                  <ActionButton action={advanceShipment.bind(null, s.id)} className={btnLine}>
                    Advance
                  </ActionButton>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
