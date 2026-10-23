import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase Project credentials for Bazaar Reels
const DEFAULT_SUPABASE_URL = 'https://kpnqubdyedtjcqqergei.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbnF1YmR5ZWR0amNxcWVyZ2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzAxODEsImV4cCI6MjEwNjI0NjE4MX0.wKPl-5xCoGhvLgo_UWEvYPm377ljUK09Wf4gnNPaWTc';

// Retrieve credentials from localStorage, environment variables, or default verified credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('bazaar_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('bazaar_supabase_key') || '' : '';

export const currentSupabaseUrl = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
export const currentSupabaseAnonKey = storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

// Check whether valid, active Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  (storedUrl || envUrl) &&
  currentSupabaseUrl &&
  currentSupabaseAnonKey &&
  !currentSupabaseUrl.includes('your-project.supabase.co') &&
  !currentSupabaseUrl.includes('placeholder') &&
  currentSupabaseUrl.startsWith('https://')
);

// Safe browser fetch wrapper that catches unhandled network failures gracefully
const safeFetch = async (input: any, init?: any): Promise<Response> => {
  const urlStr = typeof input === 'string' ? input : (input?.url || '');
  if (urlStr.includes('placeholder-bazaar-reels.supabase.co')) {
    return new Response(JSON.stringify({ error: 'Supabase credentials not configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fetchFn = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : fetch;
    return await fetchFn(input, init);
  } catch (err: any) {
    console.warn('Network fetch handled safely:', err?.message || err);
    return new Response(JSON.stringify({ error: err?.message || 'Network request failed' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Fallback placeholder client that logs informative warnings instead of crashing
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(currentSupabaseUrl, currentSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        fetch: safeFetch,
      },
    })
  : createClient(
      'https://placeholder-bazaar-reels.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
      {
        auth: { persistSession: false },
        global: {
          fetch: safeFetch,
        },
      }
    );

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('bazaar_supabase_url', url.trim());
    localStorage.setItem('bazaar_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bazaar_supabase_url');
    localStorage.removeItem('bazaar_supabase_key');
    window.location.reload();
  }
}
