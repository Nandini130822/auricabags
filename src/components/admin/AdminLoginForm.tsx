"use client";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      // only existing accounts can sign in here — no new sign-ups from the admin page
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
    setBusy(false);
    if (error) setMsg(/signups not allowed|not found/i.test(error.message) ? "No account with this email. Ask the owner to add you as an admin." : error.message);
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
        <span className="field-label">Admin email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@auricabags.com" className="field" />
      </label>
      <button disabled={busy} className="btn-dark w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Email me a sign-in link
      </button>
      {msg && <p className="text-sm text-rose">{msg}</p>}
    </form>
  );
}
