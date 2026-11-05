import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { deleteProduct } from "@/app/actions/admin";
import { ConfirmDelete } from "@/components/admin/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader, btnLine } from "@/components/admin/ui";
import { adminCategories, adminProduct } from "@/lib/admin-data";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([adminProduct(id), adminCategories()]);
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Products
      </Link>
      <PageHeader
        title={product.name}
        action={
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} target="_blank" className={btnLine}>
              <ExternalLink size={14} /> View on store
            </Link>
            <ConfirmDelete action={deleteProduct.bind(null, product.id)} />
          </div>
        }
      />
      <ProductForm product={product} categories={categories} />
    </>
  );
}
