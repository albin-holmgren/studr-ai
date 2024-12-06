import { createServerClient } from '@supabase/auth-helpers-remix'
import type { Database } from './database.types'

export function createSupabaseServerClient({
  request,
  response,
}: {
  request: Request
  response: Response
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      request,
      response,
      options: {
        db: {
          schema: 'public'
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          headers: { 'x-my-custom-header': 'studr-ai' },
        },
      },
      // Add cookie options
      cookieOptions: {
        name: 'sb-auth',
        lifetime: 60 * 60 * 8, // 8 hours
        domain: '',
        path: '/',
        sameSite: 'lax',
      },
    }
  )

  return supabase
}