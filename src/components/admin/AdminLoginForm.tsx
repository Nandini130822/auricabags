"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Admin sign-in: email + password (default), or a one-time email link.
 * Only existing accounts can sign in here; admin access is checked by the dashboard.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const sb = createClient();
    if (mode === "password") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy(false);
        setMsg(/invalid login credentials/i.test(error.message) ? "Wrong email or password." : error.message);
        return;
      }
      router.replace("/admin");
      router.refresh();
      return;
    }
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
    setBusy(false);
    if (error) setMsg(/signups not allowed|not found/i.test(error.message) ? "No account with this email." : error.message);
    else setSent(true);
  };

  if (sent)
    return (
      <div className="rounded-xl bg-cream p-6 text-center">
        <Mail className="mx-auto h-7 w-7 text-gold-deep" strokeWidth={1.4} />
        <p className="mt-3 font-display text-xl">Check your inbox</p>
        <p className="mt-1 text-sm text-muted">
          We sent a sign-in link to <b className="text-ink">{email}</b>. Open it to go straight to the dashboard.
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="field-label">Email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@auricabags.com" className="field" />
      </label>
      {mode === "password" && (
        <label className="block">
          <span className="field-label">Password</span>
          <span className="relative block">
            <input
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pr-12"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-ink">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>
      )}
      <button disabled={busy} className="btn-dark w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </button>
      {msg && <p className="text-sm text-rose">{msg}</p>}
      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "link" : "password");
          setMsg("");
        }}
        className="tap block w-full pt-2 text-center text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        {mode === "password" ? "Sign in with an email link instead" : "Sign in with a password instead"}
      </button>
    </form>
  );
}
