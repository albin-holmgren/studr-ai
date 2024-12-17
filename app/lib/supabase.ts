import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-remix'

// Create a single supabase client for interacting with your database
let browserClient: ReturnType<typeof createClient> | null = null;

export const createBrowserClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  if (typeof window === 'undefined') return null;
  
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
  return browserClient
}

export { createServerClient }
