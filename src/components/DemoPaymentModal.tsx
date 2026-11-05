"use client";
import { useState } from "react";
import { Check, CreditCard, Landmark, Loader2, ShieldCheck, Smartphone, X } from "lucide-react";
import { completeDemoPayment } from "@/app/actions/shop";
import { inr } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", "Yes Bank"];

/**
 * A look-alike of a hosted payment sheet (Razorpay/Cashfree) for client demos.
 * Nothing here talks to a real gateway; the server action records a simulated payment.
 */
export function DemoPaymentModal({
  order,
  method,
  keyId,
  onClose,
  onSuccess,
}: {
  order: { orderId: string; orderNumber: string; total: number };
  method: PaymentMethod;
  keyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<PaymentMethod>(method === "cod" ? "upi" : method);
  const [stage, setStage] = useState<"form" | "processing" | "success" | "failed">("form");
  const [err, setErr] = useState("");
  const [bank, setBank] = useState(BANKS[0]);

  const run = async (outcome: "success" | "failure") => {
    setStage("processing");
    await new Promise((r) => setTimeout(r, 1600));
    const r = await completeDemoPayment(order.orderId, outcome);
    if (r.ok) {
      setStage("success");
      setTimeout(onSuccess, 1200);
    } else {
      setErr(r.error);
      setStage("failed");
    }
  };

  const tabs = [
    { id: "upi" as const, label: "UPI", icon: Smartphone },
    { id: "card" as const, label: "Card", icon: CreditCard },
    { id: "netbanking" as const, label: "Netbanking", icon: Landmark },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white font-sans text-ink shadow-2xl">
        <div className="absolute right-0 top-0 rounded-bl-xl bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink">
          Test mode
        </div>
        <div className="flex items-center gap-3 bg-ink px-5 py-5 text-ivory">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-deep font-display text-xl text-white">A</div>
          <div className="flex-1">
            <p className="font-medium">Aurica Bags</p>
            <p className="text-xs text-ivory/60">Order {order.orderNumber}</p>
          </div>
          <p className="text-lg font-medium">{inr(order.total)}</p>
        </div>

        {stage === "form" && (
          <div>
            <div className="flex border-b">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm ${tab === t.id ? "border-b-2 border-ink font-medium" : "text-neutral-500"}`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-4 p-5 text-sm">
              {tab === "upi" && (
                <>
                  <div className="flex gap-4">
                    <div className="grid h-28 w-28 shrink-0 grid-cols-7 gap-[2px] rounded-lg border p-2">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <span key={i} className={(i * 7 + (i % 5) * 3) % 3 === 0 ? "bg-ink" : "bg-transparent"} />
                      ))}
                    </div>
                    <p className="text-neutral-600">Scan with any UPI app, or enter your UPI ID below.</p>
                  </div>
                  <input defaultValue="aurica.demo@okaxis" className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-ink" />
                </>
              )}
              {tab === "card" && (
                <>
                  <input defaultValue="4111 1111 1111 1111" className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-ink" aria-label="Card number" />
                  <div className="flex gap-3">
                    <input defaultValue="12/30" className="w-1/2 rounded-lg border px-3 py-2.5" aria-label="Expiry" />
                    <input defaultValue="123" className="w-1/2 rounded-lg border px-3 py-2.5" aria-label="CVV" />
                  </div>
                  <p className="text-xs text-neutral-500">Pre-filled with a gateway test card. No real card is charged.</p>
                </>
              )}
              {tab === "netbanking" && (
                <div className="grid grid-cols-2 gap-2">
                  {BANKS.map((b) => (
                    <button key={b} onClick={() => setBank(b)} className={`rounded-lg border px-3 py-2.5 text-left ${bank === b ? "border-ink bg-neutral-50" : ""}`}>
                      {b}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => run("success")} className="w-full rounded-lg bg-ink py-3.5 font-medium text-ivory hover:bg-ink-2">
                Pay {inr(order.total)}
              </button>
              <button onClick={() => run("failure")} className="w-full text-xs text-neutral-500 underline underline-offset-4">
                Simulate a failed payment
              </button>
            </div>
          </div>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Loader2 className="h-9 w-9 animate-spin text-gold-deep" />
            <p className="font-medium">Processing payment…</p>
            <p className="text-xs text-neutral-500">Do not close this window</p>
          </div>
        )}
        {stage === "success" && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-7 w-7" />
            </span>
            <p className="font-medium">Payment successful</p>
            <p className="text-xs text-neutral-500">Redirecting to your order…</p>
          </div>
        )}
        {stage === "failed" && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose text-white">
              <X className="h-7 w-7" />
            </span>
            <p className="font-medium">Payment failed</p>
            <p className="text-xs text-neutral-500">{err}</p>
            <button onClick={() => setStage("form")} className="mt-2 rounded-lg bg-ink px-6 py-2.5 text-sm text-ivory">
              Try again
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-5 py-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay · {keyId}</span>
          {stage === "form" && (
            <button onClick={onClose} className="underline">Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
