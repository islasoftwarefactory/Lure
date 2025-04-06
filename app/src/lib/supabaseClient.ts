import { createClient } from '@supabase/supabase-js'

// Ensure your environment variables are defined in a .env file
// (VITE requires the VITE_ prefix for client-side exposure)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.")
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 