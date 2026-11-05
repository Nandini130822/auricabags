"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/shop";

export function ReviewForm({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (!signedIn)
    return (
      <Link href="/login" className="btn-line mt-8">
        Sign in to write a review
      </Link>
    );
  if (done) return <p className="mt-8 font-serif text-xl italic">Thank you — your review will appear once approved.</p>;
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-line mt-8">
        Write a review
      </button>
    );

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const r = await submitReview(productId, rating, String(f.get("title")), String(f.get("body")));
          if (r.ok) setDone(true);
          else setMsg(r.error);
        });
      }}
    >
      <div className="flex gap-1 text-gold" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-6 w-6 ${n <= (hover || rating) ? "fill-current" : ""}`} strokeWidth={1.3} />
          </button>
        ))}
      </div>
      <input name="title" required placeholder="Headline" className="field" />
      <textarea name="body" required rows={4} placeholder="How did you style it?" className="field" />
      {msg && <p className="text-sm text-rose">{msg}</p>}
      <button disabled={pending} className="btn-dark">
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
