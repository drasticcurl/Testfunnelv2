import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Client-side Supabase (limited permissions)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (full permissions - only use in API routes)
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
