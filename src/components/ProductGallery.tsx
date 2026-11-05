"use client";
import { useState } from "react";
import { img } from "@/lib/format";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [""];
  return (
    <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
      <div className="no-scrollbar order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {list.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setActive(i)}
            className={`aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl border transition lg:w-full ${i === active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
            aria-label={`View image ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(src, 200)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="group relative order-1 aspect-[4/5] overflow-hidden rounded-[28px] bg-cream lg:order-2">
        {list.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + i}
            src={img(src, 1400)}
            alt={i === 0 ? name : ""}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${i === active ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
          />
        ))}
        <span className="absolute bottom-5 right-5 rounded-full bg-ivory/90 px-3 py-1 text-[11px] tracking-[0.2em]">
          {String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
