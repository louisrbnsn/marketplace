import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Client-side Supabase client using SSR-compatible browser client
// This properly handles cookies for Next.js App Router
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side Supabase client with service role (for admin operations)
// Only available server-side, never expose to client
export const supabaseAdmin = 
  typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : null

// Helper to ensure supabaseAdmin is available (use in server-only code)
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('supabaseAdmin is only available server-side with SUPABASE_SERVICE_ROLE_KEY')
  }
  return supabaseAdmin
}
