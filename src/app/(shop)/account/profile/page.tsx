import { updateProfile } from "@/app/actions/shop";
import { isSupabaseConfigured } from "@/lib/config";
import { getSessionUser } from "@/lib/data";

export const metadata = { title: "Profile" };

export default async function Profile() {
  const u = await getSessionUser();
  return (
    <form action={updateProfile} className="max-w-xl space-y-5">
      <h2 className="font-display text-2xl">Your details</h2>
      <label className="block">
        <span className="field-label">Full name</span>
        <input name="full_name" defaultValue={u?.profile?.full_name ?? ""} className="field" />
      </label>
      <label className="block">
        <span className="field-label">Mobile</span>
        <input name="phone" defaultValue={u?.profile?.phone ?? ""} className="field" />
      </label>
      <label className="block">
        <span className="field-label">Email</span>
        <input disabled value={u?.email ?? ""} className="field opacity-60" />
      </label>
      <button className="btn-dark" disabled={!isSupabaseConfigured}>Save changes</button>
    </form>
  );
}
