import Link from "next/link";
import { Plus, Search, Tags } from "lucide-react";
import { toggleProduct } from "@/app/actions/admin";
import { Toggle } from "@/components/admin/client";
import { Card, PageHeader, Table, Td, btnDark, btnLine, input } from "@/components/admin/ui";
import { adminCategories, adminProducts } from "@/lib/admin-data";
import { img, inr } from "@/lib/format";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = "", cat = "" } = await searchParams;
  const [all, cats] = await Promise.all([adminProducts(), adminCategories()]);
  const s = q.toLowerCase();
  const list = all.filter(
    (p) => (!cat || p.category_id === cat) && (!s || p.name.toLowerCase().includes(s) || (p.sku ?? "").toLowerCase().includes(s)),
  );

  return (
    <>
      <PageHeader
        title="Products"
        sub={`${all.length} products · ${all.filter((p) => p.is_active).length} live`}
        action={
          <div className="flex gap-2">
            <Link href="/admin/products/categories" className={btnLine}>
              <Tags size={14} /> Categories
            </Link>
            <Link href="/admin/products/new" className={btnDark}>
              <Plus size={14} /> Add product
            </Link>
          </div>
        }
      />
      <Card>
        <form className="mb-4 flex flex-wrap gap-2">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q} placeholder="Search name or SKU" className={`${input} pl-9`} />
          </div>
          <select name="cat" defaultValue={cat} className={`${input} w-auto`}>
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className={btnLine}>Filter</button>
        </form>
        <Table head={["Product", "Category", "Price", "Stock", "Live", "Featured", ""]} empty={!list.length}>
          {list.map((p) => (
            <tr key={p.id} className="hover:bg-ivory/60">
              <Td>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(p.images[0], 120)} alt="" className="size-11 rounded-lg object-cover" />
                  <div>
                    <div className="font-medium hover:underline">{p.name}</div>
                    <div className="text-xs text-muted">{p.sku}</div>
                  </div>
                </Link>
              </Td>
              <Td className="text-muted">{p.category?.name ?? "—"}</Td>
              <Td>
                {inr(p.price)}
                {p.compare_at_price ? <span className="ml-1.5 text-xs text-muted line-through">{inr(p.compare_at_price)}</span> : null}
              </Td>
              <Td>
                <span className={p.stock === 0 ? "font-medium text-rose-700" : p.stock <= 5 ? "font-medium text-amber-700" : ""}>
                  {p.stock === 0 ? "Out of stock" : p.stock}
                </span>
              </Td>
              <Td>
                <Toggle on={p.is_active} action={toggleProduct.bind(null, p.id, "is_active")} title="Show on store" />
              </Td>
              <Td>
                <Toggle on={p.is_featured} action={toggleProduct.bind(null, p.id, "is_featured")} title="Feature on home page" />
              </Td>
              <Td>
                <Link href={`/admin/products/${p.id}`} className="text-xs underline">
                  Edit
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
