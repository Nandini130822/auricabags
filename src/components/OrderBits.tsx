import { Check } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { dateTime, label } from "@/lib/format";

const TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  packed: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  out_for_delivery: "bg-fuchsia-100 text-fuchsia-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-neutral-200 text-neutral-700",
  returned: "bg-rose-100 text-rose-800",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider ${TONE[status]}`}>{label(status)}</span>;
}

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export function OrderProgress({ order }: { order: Order }) {
  if (order.status === "cancelled" || order.status === "returned")
    return <p className="rounded-2xl bg-cream px-5 py-4 text-sm">This order was {order.status}.</p>;
  const idx = STEPS.findIndex((s) => s.key === order.status);
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s.key} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-px flex-1 ${i === 0 ? "opacity-0" : done ? "bg-gold" : "bg-line"}`} />
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${done ? "border-gold bg-gold text-ink" : "border-line bg-ivory text-muted"}`}>
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </span>
              <span className={`h-px flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < idx ? "bg-gold" : "bg-line"}`} />
            </div>
            <span className={`mt-2 text-[11px] uppercase tracking-[0.12em] ${done ? "text-ink" : "text-muted"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function TrackingTimeline({ order }: { order: Order }) {
  const s = order.shipments?.[0];
  if (!s) return <p className="text-sm text-muted">Tracking details appear once your order is shipped.</p>;
  return (
    <div>
      <p className="text-sm">
        <span className="text-muted">Courier:</span> {s.courier} · <span className="text-muted">AWB:</span> <b>{s.awb}</b>
        {s.eta && <span className="text-muted"> · ETA {new Date(s.eta).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
      </p>
      <ol className="mt-5 space-y-5 border-l border-line pl-6">
        {[...s.events].reverse().map((e, i) => (
          <li key={e.at + e.status} className="relative">
            <span className={`absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-gold ring-4 ring-gold/20" : "bg-sand"}`} />
            <p className="font-medium">{e.label}</p>
            <p className="text-xs text-muted">{e.location} · {dateTime(e.at)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
