import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/LoginPanel";
import { isSupabaseConfigured } from "@/lib/config";
import { getSessionUser } from "@/lib/data";
import { img } from "@/lib/format";

export const metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") ? sp.next : "/account";
  if (isSupabaseConfigured && (await getSessionUser())) redirect(next);

  return (
    <section className="grid min-h-[calc(100svh-112px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("https://images.unsplash.com/photo-1787284461013-e58abaed4f78", 1400)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <p className="absolute bottom-14 left-14 max-w-md font-serif text-5xl leading-tight italic text-ivory">
          Every celebration deserves its own bag.
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <LoginPanel next={next} demo={!isSupabaseConfigured} error={sp.error} />
      </div>
    </section>
  );
}
