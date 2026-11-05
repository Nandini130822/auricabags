"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Banknote, CreditCard, Landmark, Lock, Smartphone, Tag } from "lucide-react";
import { useCart } from "./CartProvider";
import { DemoPaymentModal } from "./DemoPaymentModal";
import { createOrder, validateCoupon } from "@/app/actions/shop";
import { img, inr } from "@/lib/format";
import type { Address, PaymentMethod, StoreSettings } from "@/lib/types";

const STATES = ["Andhra Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];

export function CheckoutForm(props: {
  email: string;
  name: string;
  phone: string;
  signedIn: boolean;
  address: Address | null;
  payment: StoreSettings["payment"];
  delivery: { free_shipping_above: number; flat_fee: number };
}) {
  const router = useRouter();
  const { items, subtotal, clear, ready } = useCart();
  const [method, setMethod] = useState<PaymentMethod>(props.payment.upi_enabled ? "upi" : "cod");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [error, setError] = useState("");
  const [pay, setPay] = useState<{ orderId: string; orderNumber: string; total: number } | null>(null);
  const [pending, start] = useTransition();

  const discount = coupon?.discount ?? 0;
  const shipping = subtotal - discount >= props.delivery.free_shipping_above ? 0 : props.delivery.flat_fee;
  const codFee = method === "cod" ? 49 : 0;
  const total = subtotal - discount + shipping + codFee;

  const methods: { id: PaymentMethod; label: string; sub: string; icon: typeof CreditCard; on: boolean }[] = [
    { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", icon: Smartphone, on: props.payment.upi_enabled },
    { id: "card", label: "Card", sub: "Visa, Mastercard, RuPay", icon: CreditCard, on: props.payment.card_enabled },
    { id: "netbanking", label: "Netbanking", sub: "All major banks", icon: Landmark, on: props.payment.netbanking_enabled },
    { id: "cod", label: "Cash on delivery", sub: "+ ₹49 handling", icon: Banknote, on: props.payment.cod_enabled },
  ];

  if (!ready) return <div className="mt-12 h-96 animate-pulse rounded-[28px] bg-cream/60" />;
  if (items.length === 0 && !pay)
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-3xl italic">Your bag is empty.</p>
        <Link href="/shop" className="btn-dark mt-8">Continue shopping</Link>
      </div>
    );

  const a = props.address;

  return (
    <>
      <form
        className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          const f = new FormData(e.currentTarget);
          const s = (k: string) => String(f.get(k) ?? "").trim();
          start(async () => {
            const r = await createOrder({
              email: s("email"),
              address: {
                full_name: s("full_name"),
                phone: s("phone"),
                line1: s("line1"),
                line2: s("line2"),
                city: s("city"),
                state: s("state"),
                pincode: s("pincode"),
              },
              items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })),
              coupon: coupon?.code ?? null,
              method,
            });
            if (!r.ok) return setError(r.error);
            if (method === "cod") {
              clear();
              router.push(`/checkout/success?order=${r.orderId}`);
            } else setPay(r);
          });
        }}
      >
        <div className="space-y-12">
          <fieldset>
            <legend className="flex w-full items-baseline justify-between">
              <span className="font-display text-2xl">01 · Contact</span>
              {!props.signedIn && (
                <Link href="/login?next=/checkout" className="text-sm text-muted underline underline-offset-4">
                  Sign in for faster checkout
                </Link>
              )}
            </legend>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="field-label">Email</span>
                <input name="email" type="email" required defaultValue={props.email} className="field" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl">02 · Delivery address</legend>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Full name</span>
                <input name="full_name" required defaultValue={a?.full_name ?? props.name} className="field" />
              </label>
              <label>
                <span className="field-label">Mobile</span>
                <input name="phone" required inputMode="tel" defaultValue={a?.phone ?? props.phone} placeholder="+91" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className="field-label">Address</span>
                <input name="line1" required defaultValue={a?.line1} placeholder="House / flat, building, street" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className="field-label">Landmark (optional)</span>
                <input name="line2" defaultValue={a?.line2 ?? ""} className="field" />
              </label>
              <label>
                <span className="field-label">City</span>
                <input name="city" required defaultValue={a?.city} className="field" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="field-label">State</span>
                  <select name="state" required defaultValue={a?.state ?? "Gujarat"} className="field">
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  <span className="field-label">Pincode</span>
                  <input name="pincode" required pattern="\d{6}" inputMode="numeric" maxLength={6} defaultValue={a?.pincode} className="field" />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl">03 · Payment</legend>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {methods.filter((m) => m.on).map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition ${method === m.id ? "border-ink bg-white" : "border-line hover:border-ink/40"}`}
                >
                  <input type="radio" name="method" className="sr-only" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <m.icon className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                  <span className="flex-1">
                    <span className="block font-medium">{m.label}</span>
                    <span className="text-xs text-muted">{m.sub}</span>
                  </span>
                  <span className={`h-4 w-4 rounded-full border ${method === m.id ? "border-[5px] border-ink" : "border-line"}`} />
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Lock className="h-3.5 w-3.5" /> Payments are processed by Razorpay ({props.payment.mode === "test" ? "test mode — no real money is charged" : "secure"}).
            </p>
          </fieldset>
        </div>

        <aside className="h-fit rounded-[28px] bg-cream/70 p-7 sm:p-9 lg:sticky lg:top-28">
          <p className="font-display text-2xl">Order summary</p>
          <ul className="mt-6 space-y-4">
            {items.map((i) => (
              <li key={i.productId + i.color} className="flex items-center gap-4">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(i.image, 160)} alt="" className="h-full w-full object-cover" />
                  <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-bl-lg bg-ink text-[11px] text-ivory">{i.quantity}</span>
                </span>
                <span className="flex-1 text-sm">
                  <span className="block font-display text-base">{i.name}</span>
                  <span className="text-muted">{i.color}</span>
                </span>
                <span className="text-sm">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t border-line pt-6">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm">
                <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-gold-deep" /><b>{coupon.code}</b> applied</span>
                <button type="button" onClick={() => setCoupon(null)} className="text-muted underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Discount code" className="field uppercase" />
                <button
                  type="button"
                  onClick={() =>
                    start(async () => {
                      const r = await validateCoupon(code, subtotal);
                      if (r.ok) {
                        setCoupon({ code: r.code, discount: r.discount });
                        setCouponMsg("");
                      } else setCouponMsg(r.error);
                    })
                  }
                  className="btn-line px-5"
                >
                  Apply
                </button>
              </div>
            )}
            {couponMsg && <p className="mt-2 text-xs text-rose">{couponMsg}</p>}
          </div>

          <dl className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-gold-deep"><dt>Discount</dt><dd>−{inr(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{shipping ? inr(shipping) : "Free"}</dd></div>
            {codFee > 0 && <div className="flex justify-between"><dt className="text-muted">COD handling</dt><dd>{inr(codFee)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-4 text-lg"><dt>Total</dt><dd className="font-medium">{inr(total)}</dd></div>
          </dl>
          {error && <p className="mt-4 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}
          <button disabled={pending} className="btn-dark mt-7 w-full">
            {pending ? "Please wait…" : method === "cod" ? "Place order" : `Pay ${inr(total)}`}
          </button>
        </aside>
      </form>

      {pay && (
        <DemoPaymentModal
          order={pay}
          method={method}
          keyId={props.payment.key_id}
          onClose={() => setPay(null)}
          onSuccess={() => {
            clear();
            router.push(`/checkout/success?order=${pay.orderId}`);
          }}
        />
      )}
    </>
  );
}
