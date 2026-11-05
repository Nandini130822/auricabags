"use client";
import { SITE } from "@/lib/config";

/** Sends the enquiry straight to the studio's WhatsApp with the details pre-filled. */
export function WholesaleForm() {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const text = `Wholesale enquiry — Aurica Bags\nName: ${f.get("name")}\nBusiness: ${f.get("business")}\nCity: ${f.get("city")}\nQuantity: ${f.get("qty")}\nNotes: ${f.get("notes")}`;
        window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
      }}
    >
      <h2 className="h-display text-4xl">Tell us what you need</h2>
      <p className="text-muted">Our team replies on WhatsApp within a few working hours.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="field" />
        <input name="business" placeholder="Boutique / business (optional)" className="field" />
        <input name="city" required placeholder="City" className="field" />
        <select name="qty" className="field">
          <option>10–25 pieces</option>
          <option>25–50 pieces</option>
          <option>50–100 pieces</option>
          <option>100+ pieces</option>
        </select>
      </div>
      <textarea name="notes" rows={4} placeholder="Designs, colours, occasion, timeline…" className="field" />
      <button className="btn-dark">Send enquiry on WhatsApp</button>
    </form>
  );
}
