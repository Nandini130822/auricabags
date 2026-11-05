import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { adminCategories } from "@/lib/admin-data";

export default async function NewProduct() {
  const categories = await adminCategories();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Products
      </Link>
      <PageHeader title="Add product" />
      <ProductForm categories={categories} />
    </>
  );
}
