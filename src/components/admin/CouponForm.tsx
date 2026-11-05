import Link from "next/link";
import { saveCoupon } from "@/app/actions/admin";
import { SubmitButton } from "@/components/admin/client";
import { Card, Check, Field, btnDark, btnLine, input } from "@/components/admin/ui";
import type { Coupon } from "@/lib/types";

const d = (v: string | null) => (v ? v.slice(0, 10) : "");

export function CouponForm({ coupon: c }: { coupon?: Coupon }) {
  return (
    <form action={saveCoupon.bind(null, c?.id ?? null)} className="max-w-2xl space-y-4">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code">
            <input name="code" required defaultValue={c?.code} className={`${input} font-mono uppercase`} placeholder="SHAADI500" />
          </Field>
          <Field label="Type">
            <select name="type" defaultValue={c?.type ?? "percent"} className={input}>
              <option value="percent">Percentage off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </Field>
          <Field label="Value (% or ₹)">
            <input name="value" type="number" min={0} required defaultValue={c?.value} className={input} />
          </Field>
          <Field label="Max discount (₹, optional)">
            <input name="max_discount" type="number" min={0} defaultValue={c?.max_discount ?? ""} className={input} />
          </Field>
          <Field label="Minimum order (₹)">
            <input name="min_order" type="number" min={0} defaultValue={c?.min_order ?? 0} className={input} />
          </Field>
          <Field label="Usage limit (blank = unlimited)">
            <input name="usage_limit" type="number" min={0} defaultValue={c?.usage_limit ?? ""} className={input} />
          </Field>
          <Field label="Starts">
            <input name="starts_at" type="date" defaultValue={d(c?.starts_at ?? null)} className={input} />
          </Field>
          <Field label="Ends">
            <input name="ends_at" type="date" defaultValue={d(c?.ends_at ?? null)} className={input} />
          </Field>
          <Field label="Description (shown to customers)" className="sm:col-span-2">
            <input name="description" defaultValue={c?.description ?? ""} className={input} />
          </Field>
          <Check name="is_active" label="Active" defaultChecked={c ? c.is_active : true} />
        </div>
      </Card>
      <div className="flex gap-2">
        <SubmitButton className={btnDark} pendingText="Saving…">
          {c ? "Save changes" : "Create discount"}
        </SubmitButton>
        <Link href="/admin/discounts" className={btnLine}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
