import { json } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"
import { createSupabaseServerClient } from "~/lib/supabase.server"
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
})

const PRICE_IDS = {
  month: "price_1QUQAjEi4TbYsJmMlMDA0LNh",
  year: "price_1QURl6Ei4TbYsJmMef6ZyZ9c",
}

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
    const interval = formData.get("interval") as "month" | "year"
    const priceId = PRICE_IDS[interval] || PRICE_IDS.month

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://studr.ai/settings?success=true`,
      cancel_url: `https://studr.ai/settings?canceled=true`,
      customer_email: session.user.email,
      client_reference_id: session.user.id,
    })

    return json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe session creation error:", error)
    return json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
