import Link from "next/link";
import { Check, X } from "lucide-react";
import { deleteReview, setReviewStatus } from "@/app/actions/admin";
import { ActionButton, ConfirmDelete } from "@/components/admin/client";
import { Card, PageHeader, Pill, Stars, Tabs, btnDark, btnLine } from "@/components/admin/ui";
import { adminReviews } from "@/lib/admin-data";
import { date } from "@/lib/format";

export default async function Reviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;
  const all = await adminReviews();
  const list = all.filter((r) => status === "all" || r.status === status);
  const tabs = ["pending", "approved", "rejected", "all"].map((k) => ({
    key: k,
    label: k[0].toUpperCase() + k.slice(1),
    href: `/admin/reviews?status=${k}`,
    count: k === "all" ? all.length : all.filter((r) => r.status === k).length,
  }));
  return (
    <>
      <PageHeader title="Reviews" sub="New reviews stay hidden until you approve them." />
      <Tabs items={tabs} active={status} />
      {list.length === 0 && (
        <Card>
          <p className="py-6 text-center text-sm text-muted">No {status === "all" ? "" : status} reviews.</p>
        </Card>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Stars n={r.rating} />
                <div className="mt-1 font-medium">{r.title || "Untitled review"}</div>
              </div>
              <Pill value={r.status} />
            </div>
            {r.body && <p className="mt-2 text-sm leading-relaxed text-ink/80">{r.body}</p>}
            <div className="mt-3 text-xs text-muted">
              {r.author_name} · {date(r.created_at)}
              {r.product && (
                <>
                  {" · "}
                  <Link href={`/product/${r.product.slug}`} target="_blank" className="underline">
                    {r.product.name}
                  </Link>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {r.status !== "approved" && (
                <ActionButton action={setReviewStatus.bind(null, r.id, "approved")} className={btnDark}>
                  <Check size={14} /> Approve
                </ActionButton>
              )}
              {r.status !== "rejected" && (
                <ActionButton action={setReviewStatus.bind(null, r.id, "rejected")} className={btnLine}>
                  <X size={14} /> Reject
                </ActionButton>
              )}
              <ConfirmDelete action={deleteReview.bind(null, r.id)} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
