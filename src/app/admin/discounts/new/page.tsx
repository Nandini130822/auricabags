import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CouponForm } from "@/components/admin/CouponForm";
import { PageHeader } from "@/components/admin/ui";

export default function NewCoupon() {
  return (
    <>
      <Link href="/admin/discounts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} /> Discounts
      </Link>
      <PageHeader title="New discount" />
      <CouponForm />
    </>
  );
}
