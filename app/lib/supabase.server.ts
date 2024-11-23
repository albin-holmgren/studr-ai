import { createServerClient } from "@supabase/auth-helpers-remix"
import type { Database } from "./database.types"
import { getSupabaseEnvVars } from "./env.server"

const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseEnvVars()

export function createSupabaseServerClient({
  request,
  response,
}: {
  request: Request
  response: Response
}) {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    request,
    response,
  })
}