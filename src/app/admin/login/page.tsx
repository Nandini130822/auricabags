import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BagMark } from "@/components/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isSupabaseConfigured } from "@/lib/config";
import { getIsAdmin, getSessionUser } from "@/lib/data";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Separate sign-in for the admin dashboard — no storefront header/footer. */
export default async function AdminLogin() {
  // demo mode has no login; already-signed-in admins skip this page
  if (!isSupabaseConfigured || ((await getSessionUser()) && (await getIsAdmin()))) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <BagMark className="h-8 w-8 text-gold" />
          <span className="font-logo text-2xl tracking-[0.3em]">AURICA</span>
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-white p-7 shadow-sm">
          <p className="eyebrow text-center">Admin dashboard</p>
          <h1 className="mt-2 text-center font-display text-3xl">Sign in</h1>
          <p className="mb-6 mt-2 text-center text-sm text-muted">For store admins only.</p>
          <AdminLoginForm />
        </div>
        <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-ink">
          ← Back to the store
        </Link>
      </div>
    </main>
  );
}
