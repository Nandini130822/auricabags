import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { isSupabaseConfigured } from "@/lib/config";
import { getIsAdmin, getSessionUser } from "@/lib/data";
import { adminOrders, adminReviews } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getIsAdmin())) {
    const user = await getSessionUser();
    return (
      <main className="grid min-h-screen place-items-center bg-ivory px-4">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <ShieldAlert className="mx-auto text-gold" size={32} strokeWidth={1.5} />
          <h1 className="mt-4 font-display text-2xl">You don&apos;t have admin access</h1>
          <p className="mt-2 text-sm text-muted">
            You&apos;re signed in as <b className="text-ink">{user?.email ?? "a guest"}</b>. To make this account an admin, run this
            in Supabase → SQL Editor:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-3 text-left text-xs text-ivory">
            {`update profiles set role = 'admin'\nwhere email = '${user?.email ?? "you@example.com"}';`}
          </pre>
          <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
            Back to the store
          </Link>
        </div>
      </main>
    );
  }

  const [orders, reviews] = await Promise.all([adminOrders(), adminReviews()]);
  const badges = {
    "/admin/orders": orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
    "/admin/reviews": reviews.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {!isSupabaseConfigured && (
        <div className="bg-gold/90 px-4 py-1.5 text-center text-xs text-ink print:hidden">
          <b>Demo mode</b> — sample data, changes reset on restart. Connect Supabase to go live.
        </div>
      )}
      <div className="lg:flex">
        <Sidebar badges={badges} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
