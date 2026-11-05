import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-5 text-6xl">This page slipped away.</h1>
      <p className="mt-4 text-muted">Let&apos;s find you something beautiful instead.</p>
      <Link href="/shop" className="btn-dark mt-8">Shop the collection</Link>
    </section>
  );
}
