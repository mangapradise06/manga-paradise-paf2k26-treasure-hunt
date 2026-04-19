import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Deux clients Supabase :
 * - `supabaseAnon` : clé publique, safe côté navigateur (lecture selon RLS).
 * - `supabaseAdmin` : SERVICE_ROLE, **serveur uniquement** (API routes),
 *   bypass RLS. Ne jamais importer dans un composant client.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  // En build/dev ces variables peuvent manquer : on logue seulement.
  // En prod Vercel elles doivent impérativement être présentes.
  if (typeof window === "undefined") {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants"
    );
  }
}

export const supabaseAnon: SupabaseClient = createClient(
  SUPABASE_URL ?? "http://localhost:54321",
  ANON_KEY ?? "public-anon-key",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "[supabase] getSupabaseAdmin() ne peut pas être appelé côté client."
    );
  }
  if (_admin) return _admin;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant."
    );
  }
  _admin = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
