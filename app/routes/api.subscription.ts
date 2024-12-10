import { json } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"
import { createSupabaseServerClient } from "~/lib/supabase.server"
import Stripe from "stripe"
import { PrismaClient } from "@prisma/client"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

const prisma = new PrismaClient()

export const action: ActionFunction = async ({ request }) => {
  try {
    const response = new Response()
    const supabase = createSupabaseServerClient({ request, response })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const action = formData.get("action") as string

    switch (action) {
      case "cancel": {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { subscription: true },
        })

        if (!user?.subscription?.stripeSubscriptionId) {
          return json({ error: "No active subscription found" }, { status: 400 })
        }

        // Cancel at period end
        await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })

        // Update subscription in database
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { status: "canceled" },
        })

        return json({ success: true })
      }

      case "resume": {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { subscription: true },
        })

        if (!user?.subscription?.stripeSubscriptionId) {
          return json({ error: "No subscription found" }, { status: 400 })
        }

        // Remove cancellation
        await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        })

        // Update subscription in database
        await prisma.subscription.update({
          where: { userId: user.id },
          data: { status: "active" },
        })

        return json({ success: true })
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Subscription management error:", error)
    return json({ error: "Failed to manage subscription" }, { status: 500 })
  }
}
