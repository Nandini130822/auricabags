import Link from "next/link";

export function BagMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <path d="M13 15V12a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 15h23l-2.2 18.2a2 2 0 0 1-2 1.8H12.7a2 2 0 0 1-2-1.8L8.5 15Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 21.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Aurica Bags home" className={`flex min-w-0 items-center gap-2 sm:gap-2.5 ${light ? "text-ivory" : "text-ink"} ${className}`}>
      <BagMark className="h-6 w-6 shrink-0 text-gold sm:h-7 sm:w-7" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[18px] tracking-[0.24em] sm:text-[22px] sm:tracking-[0.32em]">AURICA</span>
        <span className="mt-1 text-[8px] uppercase tracking-[0.42em] opacity-60 sm:tracking-[0.5em]">Bags · Surat</span>
      </span>
    </Link>
  );
}
