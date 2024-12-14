import * as React from "react"
import { json, redirect } from "@remix-run/node"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/auth/login")
  }

  return json(null, {
    headers: response.headers,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const formData = await request.formData()
  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return redirect("/", {
    headers: response.headers,
  })
}

export default function ResetPasswordPage() {
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
            Reset Password
          </h2>
          <p className="mt-2.5 text-sm text-gray-500">
            Enter your new password below
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

          <Form method="post" className="mt-8 space-y-6">
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New password
              </Label>
              <div className="mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
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
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
