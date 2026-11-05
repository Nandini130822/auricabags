import { notFound } from "next/navigation";
import { SITE } from "@/lib/config";

const POLICIES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping & returns",
    body: [
      "Orders are dispatched from our Surat studio within 24–48 hours (wholesale ready-stock within 72 hours).",
      "Free shipping on orders above ₹1,999; a flat ₹99 applies below that. Cash on delivery is available across most pincodes with a ₹49 handling fee.",
      "Delivery typically takes 2–4 days in Gujarat and Maharashtra and 4–7 days elsewhere in India. You will receive your tracking (AWB) number by SMS and email, and can follow it in My Account → Orders.",
      "Exchanges: unused pieces with original tags and dust bag can be exchanged within 7 days of delivery. Please share an unboxing video for any damage claims.",
      "Refunds for prepaid cancellations are processed to the original payment method within 5–7 working days.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      "We collect only what we need to fulfil your order: your name, contact details, delivery address and order history.",
      "Payments are processed by our payment partner; we never see or store your full card details.",
      "We share your address and phone number with our courier partner solely to deliver your order.",
      `To access or delete your data, email ${SITE.email}.`,
    ],
  },
  terms: {
    title: "Terms of service",
    body: [
      "Product colours may vary slightly from images due to lighting and screen settings. Handcrafted embellishments may have minor, natural variations.",
      "Prices are in Indian Rupees and inclusive of applicable taxes. Offers and discount codes cannot be combined unless stated.",
      "Aurica Bags reserves the right to cancel orders in case of pricing errors or stock unavailability, with a full refund.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: POLICIES[(await params).slug]?.title };
}

export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const p = POLICIES[(await params).slug];
  if (!p) notFound();
  return (
    <section className="container-lux max-w-3xl py-20 lg:py-28">
      <p className="eyebrow">Customer care</p>
      <h1 className="h-display mt-5 text-[clamp(40px,5vw,72px)]">{p.title}</h1>
      <div className="mt-12 space-y-6 text-[16px] leading-relaxed text-muted">
        {p.body.map((t) => <p key={t}>{t}</p>)}
      </div>
    </section>
  );
}
