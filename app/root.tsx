import * as React from "react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import type { LinksFunction, LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"

import { createSupabaseServerClient } from "~/lib/supabase.server"
import { Toaster } from "~/components/ui/toaster"
import ThemeProvider from "~/components/theme-provider"
import styles from "./styles/globals.css"

export const links: LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // {
  //   rel: "stylesheet",
  //   href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  // },
  {
    rel: "stylesheet",
    href: styles,
  },
]

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  let user = null
  if (session?.user) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    user = {
      id: session.user.id,
      name: userData?.name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email,
      avatar: userData?.avatar_url || session.user.user_metadata?.avatar_url,
      subscription_tier: userData?.subscription_tier || 'free'
    }
  }

  return json(
    {
      env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      session,
      user,
    },
    {
      headers: {
        ...response.headers,
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

export default function App() {
  const { env } = useLoaderData<typeof loader>()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
          <div id="toast-root">
            <Toaster />
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.env = ${JSON.stringify(env)}`,
            }}
          />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </ThemeProvider>
      </body>
    </html>
  )
}