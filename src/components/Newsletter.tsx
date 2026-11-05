"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="mt-10 max-w-sm"
    >
      <p className="eyebrow text-ivory/50">Join the Aurica circle</p>
      {done ? (
        <p className="mt-4 text-sm text-gold-soft">Thank you — first looks at new drops are on their way.</p>
      ) : (
        <div className="mt-4 flex items-center border-b border-ivory/30 focus-within:border-gold">
          <input required type="email" placeholder="Your email" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-ivory/40" />
          <button aria-label="Subscribe" className="p-2 text-gold">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  );
}
