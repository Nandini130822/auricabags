import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getMyWishlist } from "@/lib/data";

export const metadata = { title: "Wishlist" };

export default async function Wishlist() {
  const items = await getMyWishlist();
  if (!items.length)
    return (
      <div className="rounded-[24px] bg-cream/60 p-12 text-center">
        <p className="font-serif text-3xl italic">Nothing saved yet.</p>
        <p className="mt-2 text-sm text-muted">Tap the heart on any piece to keep it here.</p>
        <Link href="/shop" className="btn-dark mt-6">Browse bags</Link>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
