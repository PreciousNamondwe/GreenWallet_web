import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Regular client for most operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// // Admin client for bypassing RLS during registration
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)