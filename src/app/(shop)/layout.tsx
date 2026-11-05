import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCategories, getIsAdmin, getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, user, isAdmin] = await Promise.all([getCategories(), getSessionUser(), getIsAdmin()]);
  const userName = user ? (user.profile?.full_name ?? "") : null;
  return (
    <CartProvider>
      <Header categories={categories} signedIn={Boolean(user)} userName={userName} isAdmin={Boolean(user) && isAdmin} />
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
