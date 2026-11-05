import Link from "next/link";
import { saveProduct } from "@/app/actions/admin";
import { ImageManager, SlugInputs, SubmitButton } from "@/components/admin/client";
import { Card, Check, Field, btnDark, btnLine, input } from "@/components/admin/ui";
import { OCCASIONS, isSupabaseConfigured } from "@/lib/config";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const p = product;
  return (
    <form action={saveProduct.bind(null, p?.id ?? null)} className="grid gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card title="Details">
          <div className="grid gap-4 sm:grid-cols-4">
            <SlugInputs name={p?.name} slug={p?.slug} />
            <Field label="Description" className="sm:col-span-4">
              <textarea name="description" rows={4} defaultValue={p?.description ?? ""} className={input} />
            </Field>
            <Field label="Material" className="sm:col-span-2">
              <input name="material" defaultValue={p?.material ?? ""} className={input} placeholder="e.g. Raw silk, zari embroidery" />
            </Field>
            <Field label="Dimensions" className="sm:col-span-2">
              <input name="dimensions" defaultValue={p?.dimensions ?? ""} className={input} placeholder="20 × 11 × 5 cm" />
            </Field>
            <Field label="Colours (comma separated)" className="sm:col-span-4">
              <input name="colors" defaultValue={p?.colors.join(", ") ?? ""} className={input} placeholder="Gold, Maroon" />
            </Field>
          </div>
        </Card>
        <Card title="Images">
          <ImageManager initial={p?.images ?? []} canUpload={isSupabaseConfigured} />
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input name="price" type="number" min={0} required defaultValue={p?.price} className={input} />
            </Field>
            <Field label="Compare at (₹)">
              <input name="compare_at_price" type="number" min={0} defaultValue={p?.compare_at_price ?? ""} className={input} />
            </Field>
            <Field label="Stock">
              <input name="stock" type="number" min={0} defaultValue={p?.stock ?? 0} className={input} />
            </Field>
            <Field label="SKU">
              <input name="sku" defaultValue={p?.sku ?? ""} className={input} />
            </Field>
          </div>
        </Card>
        <Card title="Organise">
          <Field label="Category">
            <select name="category_id" defaultValue={p?.category_id ?? ""} className={input}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-4">
            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Occasions</span>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((o) => (
                <label key={o} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" name="occasions" value={o} defaultChecked={p?.occasions.includes(o)} className="size-4 accent-[#1c1a17]" />
                  {o}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            <Check name="is_active" label="Live on store" defaultChecked={p ? p.is_active : true} />
            <Check name="is_featured" label="Feature on home page" defaultChecked={p?.is_featured} />
            <Check name="is_new" label="Mark as New Arrival" defaultChecked={p?.is_new} />
          </div>
        </Card>
        <div className="flex gap-2">
          <SubmitButton className={btnDark} pendingText="Saving…">
            {p ? "Save changes" : "Create product"}
          </SubmitButton>
          <Link href="/admin/products" className={btnLine}>
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
