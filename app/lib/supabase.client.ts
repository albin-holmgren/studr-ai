import { createClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient(env?: { NEXT_PUBLIC_SUPABASE_URL: string; NEXT_PUBLIC_SUPABASE_ANON_KEY: string }) {
  if (client) return client

  const supabaseUrl = env?.NEXT_PUBLIC_SUPABASE_URL || window.ENV?.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  client = createClient(supabaseUrl, supabaseKey)
  return client
}
