import * as React from "react"
import { json, redirect } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, Link, useActionData, useNavigation } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { db } from "~/lib/db.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return redirect("/")
  }

  return json(null, {
    headers: response.headers,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const provider = formData.get("provider") as string

  if (provider === "google") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    })

    if (error) {
      return json({ error: error.message }, { status: 400 })
    }

    return redirect(data.url, {
      headers: response.headers,
    })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  // Create or update user in Prisma database
  try {
    const user = await db.user.upsert({
      where: { email: data.user.email! },
      update: {
        name: data.user.user_metadata.name || data.user.email?.split('@')[0],
        avatar: data.user.user_metadata.avatar_url,
        updatedAt: new Date(),
      },
      create: {
        email: data.user.email!,
        name: data.user.user_metadata.name || data.user.email?.split('@')[0],
        avatar: data.user.user_metadata.avatar_url,
        workspaces: {
          create: {
            name: "My Workspace",
            emoji: "📝",
          }
        }
      },
    })
  } catch (dbError) {
    console.error("Database error:", dbError)
    return json({ error: "Failed to create user profile" }, { status: 500 })
  }

  return redirect("/", {
    headers: response.headers,
  })
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen w-full bg-[#f1f1f1] flex items-center justify-center fixed inset-0">
      <div className="w-full max-w-md px-4 mx-auto">
        <div className="bg-white py-10 px-4 shadow-xl rounded-xl sm:px-10">
          <div className="flex justify-start mb-10">
            <img
              src="/logo.png"
              alt="Studr AI Logo"
              className="h-12 w-auto"
            />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Login
          </h2>
          <p className="mt-2.5 text-sm text-gray-500">
            Continue to Studr AI platform
          </p>

          {actionData?.error && (
            <div className="rounded-lg bg-red-50 p-4 mt-8 mb-6 border border-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-red-800">
                    {actionData.error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form method="post" className="mt-8">
            <input type="hidden" name="provider" value="google" />
            <Button 
              type="submit" 
              variant="outline" 
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
              disabled={isSubmitting}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </Form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2.5 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <Form method="post" className="mt-8 space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="mt-1.5">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    required
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-[#171717] focus:outline-none focus:ring-[#171717] focus:ring-offset-2 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link to="/auth/forgot-password" className="text-sm text-gray-500 transition-colors duration-200 hover:text-gray-900">
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-[#171717] focus:outline-none focus:ring-[#171717] focus:ring-offset-2 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full rounded-lg bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  Continue
                </Button>
              </div>
            </Form>

            <div className="mt-8 text-center text-sm text-gray-500">
              <span>Don't have an account? </span>
              <Link
                to="/auth/register"
                className="inline-flex items-center font-medium text-[#171717] transition-colors duration-200 hover:text-gray-800"
              >
                Get started
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}