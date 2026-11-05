"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

/** Signs out and returns to the admin login (not the storefront). */
export async function adminSignOut() {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  redirect("/admin/login");
}
