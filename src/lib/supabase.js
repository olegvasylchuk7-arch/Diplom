import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.warn('Supabase URL/KEY не знайдено в .env. Див. .env.example');
}

export const supabase = createClient(URL || 'http://localhost', KEY || 'noop', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_READY = Boolean(URL && KEY);
