"use client";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Google sign-in shows only after it's configured in Google Cloud + Supabase (set NEXT_PUBLIC_GOOGLE_AUTH=true). */
const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function LoginPanel({ next, demo, error }: { next: string; demo: boolean; error?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(error ? "Sign-in failed. Please try again." : "");

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const google = async () => {
    setBusy("google");
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setMsg(error.message);
      setBusy(null);
    }
  };
  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    setBusy(null);
    if (error) setMsg(error.message);
    else setSent(true);
  };

  return (
    <div className="w-full max-w-sm">
      <p className="eyebrow">Welcome to Aurica</p>
      <h1 className="h-display mt-4 text-5xl">Sign in</h1>
      <p className="mt-3 text-muted">Track orders, save favourites and check out in seconds.</p>

      {demo ? (
        <div className="mt-10 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-sm">
          <p className="font-medium">Demo mode</p>
          <p className="mt-1 text-muted">
            Google sign-in activates once Supabase keys are added to <code>.env.local</code>. For now you can explore as
            a sample customer.
          </p>
          <Link href={next} className="btn-dark mt-5 w-full">Continue as demo customer</Link>
        </div>
      ) : sent ? (
        <div className="mt-10 rounded-2xl bg-cream p-6 text-center">
          <Mail className="mx-auto h-7 w-7 text-gold-deep" strokeWidth={1.4} />
          <p className="mt-3 font-display text-xl">Check your inbox</p>
          <p className="mt-1 text-sm text-muted">We sent a sign-in link to {email}.</p>
        </div>
      ) : (
        <>
          {GOOGLE_ENABLED && (
            <>
              <button onClick={google} disabled={!!busy} className="btn mt-10 w-full border border-line bg-white normal-case tracking-normal text-[15px] hover:border-ink">
                {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />} Continue with Google
              </button>
              <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}
          <form onSubmit={magic} className={GOOGLE_ENABLED ? "space-y-3" : "mt-10 space-y-3"}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field" />
            <button disabled={!!busy} className="btn-dark w-full">
              {busy === "email" ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        </>
      )}
      {msg && <p className="mt-4 text-sm text-rose">{msg}</p>}
      <p className="mt-10 text-xs text-muted">
        By continuing you agree to our <Link href="/policies/terms" className="tap underline">terms</Link> and{" "}
        <Link href="/policies/privacy" className="tap underline">privacy policy</Link>.
      </p>
    </div>
  );
}
