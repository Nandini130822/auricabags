import { deleteAddress, saveAddress } from "@/app/actions/shop";
import { isSupabaseConfigured } from "@/lib/config";
import { getMyAddresses } from "@/lib/data";

export const metadata = { title: "Addresses" };

export default async function Addresses() {
  const list = await getMyAddresses();
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-display text-2xl">Saved addresses</h2>
        {list.length === 0 && <p className="text-sm text-muted">No saved addresses yet.</p>}
        {list.map((a) => (
          <div key={a.id} className="rounded-[20px] border border-line p-5">
            <div className="flex justify-between">
              <p className="font-medium">{a.full_name}</p>
              {a.is_default && <span className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">Default</span>}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}
            </p>
            {isSupabaseConfigured && a.id && (
              <form action={deleteAddress.bind(null, a.id)}>
                <button className="mt-3 text-xs text-muted underline">Remove</button>
              </form>
            )}
          </div>
        ))}
      </div>
      <form action={saveAddress} className="h-fit space-y-3 rounded-[24px] bg-cream/60 p-6 sm:p-8">
        <h2 className="font-display text-2xl">Add an address</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="full_name" required placeholder="Full name" className="field" />
          <input name="phone" required placeholder="Mobile" className="field" />
        </div>
        <input name="line1" required placeholder="House / flat, street" className="field" />
        <input name="line2" placeholder="Landmark (optional)" className="field" />
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="city" required placeholder="City" className="field" />
          <input name="state" required placeholder="State" className="field" />
          <input name="pincode" required pattern="\d{6}" placeholder="Pincode" className="field" />
        </div>
        <button className="btn-dark" disabled={!isSupabaseConfigured}>Save address</button>
        {!isSupabaseConfigured && <p className="text-xs text-muted">Saving is enabled once Supabase is connected.</p>}
      </form>
    </div>
  );
}
