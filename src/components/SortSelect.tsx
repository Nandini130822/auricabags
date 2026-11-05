"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <select
      value={value}
      onChange={(e) => {
        const q = new URLSearchParams(sp.toString());
        q.set("sort", e.target.value);
        router.push(`${path}?${q}`);
      }}
      className="rounded-full border border-line bg-transparent px-4 py-2 text-[13px] outline-none focus:border-ink"
      aria-label="Sort products"
    >
      <option value="featured">Featured</option>
      <option value="new">Newest</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
    </select>
  );
}
