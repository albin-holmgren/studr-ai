import { json } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"
import Stripe from "stripe"
import { PrismaClient } from "@prisma/client"

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("Stripe environment variables must be set")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

const prisma = new PrismaClient()

export const action: ActionFunction = async ({ request }) => {
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return json({ error: "No signature" }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        await prisma.subscription.create({
          data: {
            userId: session.client_reference_id!,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: "pro",
            status: "active",
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: invoice.subscription as string,
          },
          data: {
            stripePriceId: invoice.lines.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            status: "canceled",
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }
    }

    return json({ received: true })
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return json({ error: "Webhook error" }, { status: 400 })
  }
}
