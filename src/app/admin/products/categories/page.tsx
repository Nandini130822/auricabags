import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { ConfirmDelete, SubmitButton } from "@/components/admin/client";
import { Card, PageHeader, btnDark, btnLine, input } from "@/components/admin/ui";
import { adminCategories, adminProducts } from "@/lib/admin-data";

export default async function Categories() {
  const [cats, products] = await Promise.all([adminCategories(), adminProducts()]);
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Products
      </Link>
      <PageHeader title="Categories" sub="These appear as collections in the store menu." />
      <div className="space-y-3">
        {cats.map((c) => (
          <Card key={c.id}>
            <form action={saveCategory.bind(null, c.id)} className="grid items-end gap-3 md:grid-cols-[1fr_1fr_2fr_80px_auto]">
              <input name="name" defaultValue={c.name} className={input} placeholder="Name" />
              <input name="slug" defaultValue={c.slug} className={input} placeholder="slug" />
              <input name="image_url" defaultValue={c.image_url ?? ""} className={input} placeholder="Cover image URL" />
              <input name="sort_order" type="number" defaultValue={c.sort_order} className={input} title="Sort order" />
              <div className="flex gap-2">
                <SubmitButton className={btnLine}>Save</SubmitButton>
                <ConfirmDelete action={deleteCategory.bind(null, c.id)} text="" />
              </div>
              <input name="description" defaultValue={c.description ?? ""} className={`${input} md:col-span-4`} placeholder="Short description" />
              <span className="text-xs text-muted">{products.filter((p) => p.category_id === c.id).length} products</span>
            </form>
          </Card>
        ))}
        <Card title="Add category">
          <form action={saveCategory.bind(null, null)} className="grid items-end gap-3 md:grid-cols-[1fr_2fr_2fr_auto]">
            <input name="name" required className={input} placeholder="Name e.g. Bridal Potlis" />
            <input name="image_url" className={input} placeholder="Cover image URL" />
            <input name="description" className={input} placeholder="Short description" />
            <input type="hidden" name="sort_order" value={cats.length + 1} />
            <SubmitButton className={btnDark}>Add</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
