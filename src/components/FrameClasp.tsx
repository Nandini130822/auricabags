/**
 * A realistic evening-clutch metal frame drawn in SVG: a polished brass frame bar with
 * hinge rivets, and a kiss-lock (two shiny balls on short posts) at the centre.
 * Wrap a photo box with it; the frame sits across the photo's top edge.
 * `uid` keeps the SVG gradient ids unique per card.
 */
export function FrameClasp({ uid, children }: { uid: string; children: React.ReactNode }) {
  const id = (n: string) => `fc-${uid}-${n}`;
  return (
    <div className="frame-clasp relative pt-[22px]">
      <svg aria-hidden className="pointer-events-none absolute -left-[3px] -right-[3px] top-0 z-10 h-[32px] w-[calc(100%+6px)] overflow-visible">
        <defs>
          <linearGradient id={id("rail")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fdf0c4" />
            <stop offset="0.28" stopColor="#e4c172" />
            <stop offset="0.55" stopColor="#a87a33" />
            <stop offset="0.78" stopColor="#e7c983" />
            <stop offset="1" stopColor="#6f4f1d" />
          </linearGradient>
          <radialGradient id={id("ball")} cx="0.34" cy="0.3" r="0.78">
            <stop offset="0" stopColor="#fffbea" />
            <stop offset="0.16" stopColor="#f6dc98" />
            <stop offset="0.45" stopColor="#d2a650" />
            <stop offset="0.78" stopColor="#966b28" />
            <stop offset="1" stopColor="#5a3f15" />
          </radialGradient>
          <linearGradient id={id("post")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6f4f1d" />
            <stop offset="0.5" stopColor="#efd38f" />
            <stop offset="1" stopColor="#6f4f1d" />
          </linearGradient>
          <filter id={id("shadow")} x="-10%" y="-50%" width="120%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#1c1a17" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* frame bar */}
        <g filter={`url(#${id("shadow")})`}>
          <rect x="0" y="19" width="100%" height="8" rx="4" fill={`url(#${id("rail")})`} />
        </g>
        <rect x="1.5%" y="19.8" width="97%" height="1.2" rx="0.6" fill="#fff8df" opacity="0.75" />

        {/* hinge rivets at both ends */}
        <circle cx="7" cy="23" r="2.4" fill={`url(#${id("ball")})`} />
        <svg x="100%" overflow="visible">
          <circle cx="-7" cy="23" r="2.4" fill={`url(#${id("ball")})`} />
        </svg>

        {/* kiss-lock at the centre */}
        <svg x="50%" overflow="visible">
          <rect x="-10.5" y="17.6" width="7" height="3.4" rx="1.2" fill={`url(#${id("rail")})`} />
          <rect x="3.5" y="17.6" width="7" height="3.4" rx="1.2" fill={`url(#${id("rail")})`} />
          <g className="kl-left">
            <path d="M-6.5 21 C-6.8 17.5 -6 15 -4.8 13.2" stroke={`url(#${id("post")})`} strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <circle cx="-4.7" cy="8.6" r="6.3" fill={`url(#${id("ball")})`} filter={`url(#${id("shadow")})`} />
            <ellipse cx="-6.6" cy="6.3" rx="1.9" ry="1.25" fill="#fff" opacity="0.85" />
          </g>
          <g className="kl-right">
            <path d="M6.5 21 C6.8 17.5 6 15 4.8 13.2" stroke={`url(#${id("post")})`} strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <circle cx="4.7" cy="8.6" r="6.3" fill={`url(#${id("ball")})`} filter={`url(#${id("shadow")})`} />
            <ellipse cx="2.8" cy="6.3" rx="1.9" ry="1.25" fill="#fff" opacity="0.85" />
          </g>
        </svg>
      </svg>
      {children}
    </div>
  );
}
