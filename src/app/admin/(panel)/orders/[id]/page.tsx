import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Truck } from "lucide-react";
import { advanceShipment, createShipment, markCodPaid, refundOrder, updateOrderStatus } from "@/app/actions/admin";
import { ActionButton, PrintButton, StatusSelect, SubmitButton } from "@/components/admin/client";
import { Card, DemoNote, PageHeader, Pill, btnDark, btnLine } from "@/components/admin/ui";
import { adminOrder, adminSettings } from "@/lib/admin-data";
import { ORDER_STATUSES } from "@/lib/config";
import { dateTime, date, img, inr, label } from "@/lib/format";
import { SHIP_FLOW, SHIP_LABEL, quoteCouriers } from "@/lib/shipping";
import type { OrderStatus } from "@/lib/types";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [o, settings] = await Promise.all([adminOrder(id), adminSettings()]);
  if (!o) notFound();
  const a = o.shipping_address;
  const pay = o.payments?.[0];
  const ship = o.shipments?.[0];
  const quotes = quoteCouriers(a.pincode, settings.delivery.couriers, settings.delivery.pickup_pincode);
  const canAdvance = ship && SHIP_FLOW.indexOf(ship.status as (typeof SHIP_FLOW)[number]) < SHIP_FLOW.length - 1 && ship.status !== "rto";
  const setStatus = async (v: string) => {
    "use server";
    await updateOrderStatus(id, v as OrderStatus);
  };

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink print:hidden">
        <ArrowLeft size={14} /> Orders
      </Link>
      <div className="print:hidden">
        <PageHeader
          title={`Order #${o.order_number}`}
          sub={`Placed ${dateTime(o.created_at)} · ${o.email}`}
          action={
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.12em] text-muted">Status</span>
              <StatusSelect value={o.status} options={ORDER_STATUSES} onChange={setStatus} />
            </div>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3 print:hidden">
        <div className="space-y-4 xl:col-span-2">
          <Card title="Items">
            <ul className="divide-y divide-line">
              {o.order_items?.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(i.image, 160)} alt="" className="size-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.name}</div>
                    <div className="text-xs text-muted">
                      {i.color ? `${i.color} · ` : ""}
                      {inr(i.price)} × {i.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium">{inr(i.price * i.quantity)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>
              {o.discount > 0 && (
                <div className="flex justify-between"><dt className="text-muted">Discount {o.coupon_code && <span className="ml-1 rounded bg-cream px-1.5 text-xs">{o.coupon_code}</span>}</dt><dd className="text-emerald-700">−{inr(o.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted">Shipping{o.payment_method === "cod" ? " + COD fee" : ""}</dt><dd>{o.shipping_fee ? inr(o.shipping_fee) : "Free"}</dd></div>
              <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
            </dl>
          </Card>

          {/* ------------------------------------------------ DELIVERY */}
          <Card title="Delivery" action={<span className="text-xs text-muted">{label(settings.delivery.provider)} · {settings.delivery.mode} mode</span>}>
            {!ship ? (
              o.status === "cancelled" ? (
                <p className="text-sm text-muted">Order cancelled — no shipment needed.</p>
              ) : (
                <form action={createShipment.bind(null, o.id)} className="space-y-3">
                  <p className="text-sm text-muted">
                    Choose a courier for pincode <b className="text-ink">{a.pincode}</b>. Rates are demo quotes from the shipping aggregator.
                  </p>
                  {quotes.length === 0 ? (
                    <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">This pincode is not serviceable.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {quotes.map((q, i) => (
                        <label key={q.courier} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 has-[:checked]:border-ink has-[:checked]:bg-ivory">
                          <input type="radio" name="courier" value={q.courier} defaultChecked={i === 0} className="accent-[#1c1a17]" />
                          <span className="flex-1 text-sm font-medium">{q.courier}</span>
                          <span className="text-xs text-muted">{inr(q.rate)} · {q.etaDays}d</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <input type="hidden" name="eta" value={quotes[0]?.etaDays ?? 4} />
                  <SubmitButton className={btnDark} pendingText="Creating…">
                    <Truck size={14} /> Create shipment & generate AWB
                  </SubmitButton>
                </form>
              )
            ) : (
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-muted">Courier </span><b>{ship.courier}</b></div>
                  <div><span className="text-muted">AWB </span><b className="font-mono">{ship.awb}</b></div>
                  {ship.eta && <div><span className="text-muted">ETA </span>{date(ship.eta)}</div>}
                  <Pill value={ship.status} />
                </div>
                <ol className="relative ml-2 space-y-4 border-l border-line pl-6">
                  {[...SHIP_FLOW, ...(ship.status === "rto" ? (["rto"] as const) : [])].map((st) => {
                    const ev = ship.events.find((e) => e.status === st);
                    return (
                      <li key={st} className="relative">
                        <span className="absolute -left-[33px] top-0.5 bg-white">
                          {ev ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-stone-300" />}
                        </span>
                        <div className={`text-sm ${ev ? "font-medium" : "text-muted"}`}>{SHIP_LABEL[st]}</div>
                        {ev && <div className="text-xs text-muted">{ev.location} · {dateTime(ev.at)}</div>}
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-5 flex flex-wrap gap-2">
                  {canAdvance && (
                    <ActionButton action={advanceShipment.bind(null, ship.id)} className={btnDark}>
                      Advance status (simulate courier update)
                    </ActionButton>
                  )}
                  <PrintButton />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Customer">
            <div className="text-sm font-medium">{o.customer_name}</div>
            <div className="text-sm text-muted">{o.email}</div>
            <div className="text-sm text-muted">{o.phone}</div>
            {o.user_id && (
              <Link href={`/admin/customers/${o.user_id}`} className="mt-2 inline-block text-xs underline">
                View customer
              </Link>
            )}
            <div className="mt-4 border-t border-line pt-4 text-sm leading-relaxed">
              <div className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">Ship to</div>
              {a.full_name}
              <br />
              {a.line1}
              {a.line2 ? <>, {a.line2}</> : null}
              <br />
              {a.city}, {a.state} {a.pincode}
            </div>
          </Card>

          {/* ------------------------------------------------ PAYMENT */}
          <Card title="Payment">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Method</dt><dd className="uppercase">{o.payment_method}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><Pill value={o.payment_status} /></dd></div>
              {pay && (
                <>
                  <div className="flex justify-between"><dt className="text-muted">Gateway</dt><dd>{pay.provider === "cod" ? "Cash on delivery" : "Razorpay (demo)"}</dd></div>
                  <div className="flex justify-between gap-2"><dt className="text-muted">Payment ID</dt><dd className="truncate font-mono text-xs">{pay.provider_payment_id}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd>{inr(pay.amount)}</dd></div>
                </>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {o.payment_method === "cod" && o.payment_status === "pending" && (
                <ActionButton action={markCodPaid.bind(null, o.id)} className={btnDark}>
                  Mark cash received
                </ActionButton>
              )}
              {o.payment_status === "paid" && (
                <ActionButton action={refundOrder.bind(null, o.id)} confirmText="Issue a full refund (demo)?" className={btnLine}>
                  Refund (demo)
                </ActionButton>
              )}
            </div>
          </Card>
          <DemoNote>
            Payment and courier steps here are <b>simulated</b>. With live Razorpay &amp; Shiprocket keys, these update automatically through
            their webhooks.
          </DemoNote>
        </div>
      </div>

      {/* ------------------------------------------------ PRINTABLE LABEL */}
      {ship && (
        <div className="hidden print:block">
          <div className="mx-auto max-w-md border-2 border-black p-6 font-sans text-black">
            <div className="flex items-center justify-between border-b border-black pb-3">
              <span className="text-2xl tracking-[0.2em]">AURICA</span>
              <span className="text-sm">{ship.courier}</span>
            </div>
            <div className="py-4 text-center font-mono text-3xl tracking-widest">{ship.awb}</div>
            <div className="border-t border-black pt-3 text-sm">
              <b>Deliver to:</b>
              <br />
              {a.full_name} · {a.phone}
              <br />
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} — <b>{a.pincode}</b>
            </div>
            <div className="mt-3 flex justify-between border-t border-black pt-3 text-sm">
              <span>Order #{o.order_number}</span>
              <span>{o.payment_method === "cod" && o.payment_status !== "paid" ? `COD ${inr(o.total)}` : "PREPAID"}</span>
            </div>
            <div className="mt-3 border-t border-black pt-3 text-xs">From: Aurica Bags, Adajan, Surat, Gujarat {settings.delivery.pickup_pincode}</div>
          </div>
        </div>
      )}
    </>
  );
}
