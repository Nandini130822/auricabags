import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/CouponForm";
import { PageHeader } from "@/components/admin/ui";
import { adminCoupon } from "@/lib/admin-data";

export default async function EditCoupon({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await adminCoupon(id);
  if (!coupon) notFound();
  return (
    <>
      <Link href="/admin/discounts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Discounts
      </Link>
      <PageHeader title={coupon.code} sub={`Used ${coupon.used_count} times`} />
      <CouponForm coupon={coupon} />
    </>
  );
}
