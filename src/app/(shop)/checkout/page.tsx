import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getMyAddresses, getSessionUser, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [user, settings, addresses] = await Promise.all([getSessionUser(), getSettings(), getMyAddresses()]);
  return (
    <section className="container-lux py-14 lg:py-20">
      <p className="eyebrow">Secure checkout</p>
      <h1 className="h-display mt-4 text-[clamp(40px,5vw,72px)]">Almost yours.</h1>
      <CheckoutForm
        email={user?.email ?? ""}
        name={user?.profile?.full_name ?? ""}
        phone={user?.profile?.phone ?? ""}
        signedIn={Boolean(user)}
        address={addresses[0] ?? null}
        payment={settings.payment}
        delivery={{ free_shipping_above: settings.delivery.free_shipping_above, flat_fee: settings.delivery.flat_fee }}
      />
    </section>
  );
}
