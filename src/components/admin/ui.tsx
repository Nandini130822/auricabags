import Link from "next/link";
import { Star } from "lucide-react";
import { label } from "@/lib/format";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/80">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  gray: "bg-stone-100 text-stone-600 ring-stone-200",
};
const STATUS_TONE: Record<string, string> = {
  pending: "amber",
  confirmed: "blue",
  packed: "violet",
  shipped: "blue",
  out_for_delivery: "violet",
  delivered: "green",
  cancelled: "gray",
  returned: "red",
  paid: "green",
  failed: "red",
  refunded: "gray",
  captured: "green",
  created: "amber",
  picked_up: "blue",
  in_transit: "blue",
  rto: "red",
  approved: "green",
  rejected: "red",
  active: "green",
  inactive: "gray",
  admin: "violet",
  customer: "gray",
  blocked: "red",
};

export function Pill({ value, tone }: { value: string; tone?: string }) {
  const t = TONES[tone ?? STATUS_TONE[value] ?? "gray"];
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${t}`}>
      {label(value)}
    </span>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-gold">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={13} fill={i < n ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-muted">
            {head.map((h, i) => (
              <th key={i} className="px-5 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-5 py-10 text-center text-sm text-muted">Nothing here yet.</p>}
    </div>
  );
}

export const Td = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <td className={`px-5 py-3 align-middle ${className}`}>{children}</td>
);

export function Tabs({ items, active }: { items: { label: string; href: string; key: string; count?: number }[]; active: string }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {items.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${
            active === t.key ? "bg-ink text-ivory" : "bg-white text-ink/70 ring-1 ring-line hover:text-ink"
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 opacity-60">{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Kpi({ label: l, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between text-muted">
        <span className="text-[11px] uppercase tracking-[0.14em]">{l}</span>
        {icon}
      </div>
      <div className="mt-3 font-display text-2xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export const btn = "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition cursor-pointer disabled:opacity-50";
export const btnDark = `${btn} bg-ink text-ivory hover:bg-gold-deep`;
export const btnLine = `${btn} bg-white ring-1 ring-line hover:ring-ink/40`;
export const btnDanger = `${btn} bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50`;
export const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold";
export const lbl = "mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted";

export function Field({ label: l, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={lbl}>{l}</span>
      {children}
    </label>
  );
}

export function Check({ name, label: l, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#1c1a17]" />
      {l}
    </label>
  );
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-gold/50 bg-cream/60 px-4 py-3 text-[13px] leading-relaxed text-ink/80">{children}</div>;
}
