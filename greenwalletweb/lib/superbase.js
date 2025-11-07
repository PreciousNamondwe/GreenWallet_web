import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ryyolcydqdaaylhgsupa.supabase.co'
const supabaseAnonKey = 'sb_publishable_Rf9ykkyHs0lJRqFZ_P-5EA_aYAaSO1V'
const supabaseServiceKey = 'sb_secret_0_A6LHYsdLKToxspuF06OQ_SSwnUhyd' // Get this from Supabase dashboard

// Regular client for most operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for bypassing RLS during registration
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)