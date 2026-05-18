import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Returns null when env vars are absent so callers can skip DB operations
// gracefully — the demo path never depends on Supabase being configured.
function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export const supabase = createSupabaseClient();

export interface CachedTrace {
  wallet_address: string;
  chain: string;
  tx_data: unknown;
  tx_count: number;
  total_value_usd: number;
  expires_at: string;
}

export interface GeneratedReport {
  wallet_address: string;
  sections: unknown;
  exhibit_count: number;
}
