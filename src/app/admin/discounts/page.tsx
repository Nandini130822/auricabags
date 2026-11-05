import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteCoupon, toggleCoupon } from "@/app/actions/admin";
import { ConfirmDelete, Toggle } from "@/components/admin/client";
import { Card, PageHeader, Table, Td, btnDark } from "@/components/admin/ui";
import { adminCoupons } from "@/lib/admin-data";
import { date, inr } from "@/lib/format";

export default async function Discounts() {
  const list = await adminCoupons();
  return (
    <>
      <PageHeader
        title="Discounts & offers"
        sub="Codes customers can enter at checkout."
        action={
          <Link href="/admin/discounts/new" className={btnDark}>
            <Plus size={14} /> New discount
          </Link>
        }
      />
      <Card>
        <Table head={["Code", "Offer", "Min. order", "Used", "Valid", "Active", ""]} empty={!list.length}>
          {list.map((c) => (
            <tr key={c.id} className="hover:bg-ivory/60">
              <Td>
                <Link href={`/admin/discounts/${c.id}`} className="rounded bg-cream px-2 py-1 font-mono text-[13px] font-medium hover:underline">
                  {c.code}
                </Link>
                {c.description && <div className="mt-1 max-w-56 truncate text-xs text-muted">{c.description}</div>}
              </Td>
              <Td>
                {c.type === "percent" ? `${c.value}% off` : `${inr(c.value)} off`}
                {c.max_discount ? <div className="text-xs text-muted">up to {inr(c.max_discount)}</div> : null}
              </Td>
              <Td>{c.min_order ? inr(c.min_order) : "—"}</Td>
              <Td>
                {c.used_count}
                <span className="text-muted"> / {c.usage_limit ?? "∞"}</span>
                {c.usage_limit ? (
                  <div className="mt-1 h-1 w-20 overflow-hidden rounded bg-cream">
                    <div className="h-full bg-gold" style={{ width: `${Math.min(100, (c.used_count / c.usage_limit) * 100)}%` }} />
                  </div>
                ) : null}
              </Td>
              <Td className="text-xs text-muted">
                {c.starts_at || c.ends_at ? `${c.starts_at ? date(c.starts_at) : "Now"} → ${c.ends_at ? date(c.ends_at) : "No end"}` : "Always"}
              </Td>
              <Td>
                <Toggle on={c.is_active} action={toggleCoupon.bind(null, c.id)} />
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/discounts/${c.id}`} className="text-xs underline">
                    Edit
                  </Link>
                  <ConfirmDelete action={deleteCoupon.bind(null, c.id)} text="" />
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
