import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCategories, getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, user] = await Promise.all([getCategories(), getSessionUser()]);
  return (
    <CartProvider>
      <Header categories={categories} signedIn={Boolean(user)} />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      {!isSupabaseConfigured && (
        <div className="fixed bottom-4 left-4 z-40 rounded-full bg-ink/90 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-ivory shadow-lg backdrop-blur">
          Demo mode · sample data
        </div>
      )}
    </CartProvider>
  );
}
