import * as React from "react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import type { LinksFunction, LoaderFunction, ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"

import { createSupabaseServerClient } from "~/lib/supabase.server"
import { Toaster } from "~/components/ui/toaster"
import ThemeProvider from "~/components/theme-provider"
import styles from "./styles/globals.css"
import { PrismaClient } from '@prisma/client'
import { SearchCommand } from "~/components/search-command"
import { ArchiveCommand } from "~/components/archive-command"
import { SettingsDialog } from "~/components/settings-dialog"
import type { User, LoaderData } from "~/lib/types"

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
]

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const response = new Response()
    const supabase = createSupabaseServerClient({ request, response })
    const prisma = new PrismaClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    let user: User | null = null
    if (session?.user) {
      const dbUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        include: {
          notificationSettings: true,
          subscription: true
        }
      })

      if (dbUser) {
        user = {
          id: dbUser.id,
          name: dbUser.name || "Anonymous User",
          email: dbUser.email,
          avatar: dbUser.avatarUrl,
          notificationSettings: dbUser.notificationSettings ? {
            emailNotifications: dbUser.notificationSettings.emailNotifications,
            studyReminders: dbUser.notificationSettings.studyReminders,
            marketingEmails: dbUser.notificationSettings.marketingEmails
          } : null,
          subscription: dbUser.subscription ? {
            plan: dbUser.subscription.plan,
            status: dbUser.subscription.status
          } : null
        }
      }
    }

    return json<LoaderData>({ user })
  } catch (error) {
    console.error('Error in root loader:', error)
    return json<LoaderData>({ user: null, error: "Internal server error" })
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggleTheme") {
    const theme = formData.get("theme");
    const response = await fetch("/api/theme", {
      method: "POST",
      body: JSON.stringify({ theme }),
    });
    const data = await response.json();
    return json(data);
  }

  return null;
};

export default function App() {
  const { user } = useLoaderData<LoaderData>()
  const [isClient, setIsClient] = React.useState(false)
  const [showSearch, setShowSearch] = React.useState(false)
  const [showArchive, setShowArchive] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setShowSearch(true)
      }
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setShowArchive(true)
      }
      if (event.key === "," && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setShowSettings(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {isClient ? (
          <ThemeProvider>
            <Outlet />
            <SearchCommand open={showSearch} onOpenChange={setShowSearch} />
            <ArchiveCommand open={showArchive} onOpenChange={setShowArchive} />
            {user && showSettings && (
              <SettingsDialog
                user={user}
                open={showSettings}
                onOpenChange={setShowSettings}
              />
            )}
            <Toaster />
          </ThemeProvider>
        ) : (
          <Outlet />
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error("Root error:", error)

  let errorMessage = "An unexpected error occurred"
  let statusText = "Error"
  
  if (error instanceof Error) {
    errorMessage = error.message
  } else if (error instanceof Response) {
    errorMessage = error.statusText || error.data
    statusText = error.statusText || "Error"
  } else if (error && typeof error === 'object' && 'data' in error) {
    errorMessage = String(error.data)
    if ('statusText' in error) {
      statusText = String(error.statusText)
    }
  }

  return (
    <html>
      <head>
        <title>Error - {statusText}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <h1 className="text-2xl font-bold text-red-600">{statusText}</h1>
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <pre className="text-sm text-red-800 whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </div>
            <div className="flex justify-center">
              <a href="/" className="text-blue-600 hover:underline">
                Go back home
              </a>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}