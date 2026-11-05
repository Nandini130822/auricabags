import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/config";
import { realtimeTransport } from "./ws";

/**
 * Service-role client — bypasses RLS. Only used on the server for trusted operations
 * (placing orders with server-side price checks, demo payment capture).
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false }, realtime: realtimeTransport });
}
