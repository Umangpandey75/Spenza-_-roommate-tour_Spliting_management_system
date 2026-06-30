import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let supabaseInstance = null;

export function createClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Supabase URL present:', !!url);
      console.log('🔍 Supabase Key present:', !!key);
    }

    if (!url || !key) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    supabaseInstance = createSupabaseClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        sessionTimeout: 3600,
        refreshTokenMargin: 300,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
        heartbeatIntervalMs: 30000,
        reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000)
      },
      global: { headers: { 'X-Client-Info': 'spenza-web-app' } }
    });
  }
  return supabaseInstance;
}
