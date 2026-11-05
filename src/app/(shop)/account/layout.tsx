import { redirect } from "next/navigation";
import { AccountNav } from "@/components/AccountNav";
import { getIsAdmin, getSessionUser } from "@/lib/data";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const isAdmin = await getIsAdmin();
  const name = user.profile?.full_name || user.email.split("@")[0];

  return (
    <section className="container-lux py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">My Aurica</p>
          <h1 className="h-display mt-3 text-[clamp(36px,4.5vw,60px)]">
            Hello, <span className="font-serif italic text-gold-deep">{name.split(" ")[0]}</span>
          </h1>
        </div>
        <p className="text-sm text-muted">{user.email}</p>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <AccountNav isAdmin={isAdmin} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
