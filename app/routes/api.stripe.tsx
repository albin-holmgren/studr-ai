import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { db } from "~/lib/db.server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const SUBSCRIPTION_PLANS = {
  pro: {
    name: "Pro",
    price: "price_XXXXX", // Replace with your Stripe price ID
    features: [
      "Unlimited workspaces",
      "Advanced AI features",
      "Priority support",
      "Custom themes",
    ],
  },
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const env = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    };

    const response = new Response();
    const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      request,
      response,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error("No session found");
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    console.log("Received request body:", body);

    if (body.action === "create-checkout") {
      console.log("Creating checkout session for user:", session.user.email);
      
      const user = await db.user.findUnique({
        where: { email: session.user.email! },
      });

      if (!user) {
        console.error("User not found:", session.user.email);
        return json({ error: "User not found" }, { status: 404 });
      }

      try {
        let customerId = user.stripeCustomerId;

        if (!customerId) {
          console.log("Creating new Stripe customer");
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: user.id,
            },
          });
          customerId = customer.id;
          await db.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customerId },
          });
        }

        console.log("Creating checkout session with customer:", customerId);

        const checkoutSession = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product: body.productId,
                recurring: {
                  interval: body.billingInterval,
                },
                unit_amount: body.billingInterval === 'month' ? 2100 : 17 * 1200,
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.APP_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.APP_URL}/settings`,
          metadata: {
            userId: user.id,
          },
        });

        console.log("Checkout session created:", checkoutSession.id);
        return json({ url: checkoutSession.url });
      } catch (error) {
        console.error("Stripe error:", error);
        return json(
          { error: error instanceof Error ? error.message : "Failed to create checkout session" },
          { status: 500 }
        );
      }
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
