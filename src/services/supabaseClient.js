import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ezysipmtljznwfhmpheb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// The standard client for Dashboard / public portal access
// Falls back to service role key if anon key is missing/invalid (RLS is disabled)
const publicKey = supabaseAnonKey && !supabaseAnonKey.endsWith('.REDACTED') ? supabaseAnonKey : supabaseServiceKey;
export const supabase = createClient(supabaseUrl, publicKey);

// Admin client with Service Role (Bypasses RLS - use only in Admin page)
// NOTE: Creating two Supabase clients in the browser can create multiple
// GoTrue auth instances that share the same storage key; the library warns
// about this. To avoid that warning and unsafe shared state we:
//  - disable session persistence for the admin client, and
//  - give it a distinct `storageKey` so it doesn't collide with the public client.
// This avoids the runtime warning while keeping parity with the original code.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		persistSession: false,
		// unique storage key prevents GoTrueClient collision in the same browser
		storageKey: 'supabase-admin-auth-token',
		// don't auto-refresh tokens from this admin client in the browser
		autoRefreshToken: false,
	},
});
