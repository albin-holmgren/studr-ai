import { createBrowserClient } from "@supabase/auth-helpers-remix"
import type { Database } from "./database.types"

export function createSupabaseBrowserClient() {
  if (!window.env?.SUPABASE_URL) {
    throw new Error('Missing env.SUPABASE_URL')
  }
  if (!window.env?.SUPABASE_ANON_KEY) {
    throw new Error('Missing env.SUPABASE_ANON_KEY')
  }

  return createBrowserClient<Database>(
    window.env.SUPABASE_URL,
    window.env.SUPABASE_ANON_KEY
  )
}