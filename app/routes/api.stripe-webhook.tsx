import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import Stripe from "stripe";
import { db } from "~/lib/db.server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function action({ request }: ActionFunctionArgs) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const paymentMethod = await stripe.paymentMethods.retrieve(
          subscription.default_payment_method as string
        );
        
        // Update subscription status
        await db.user.update({
          where: {
            id: session.metadata?.userId,
          },
          data: {
            subscriptionStatus: subscription.status,
            subscriptionTier: "pro",
            subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Add payment method
        await db.paymentMethod.create({
          data: {
            userId: session.metadata?.userId!,
            stripePaymentMethodId: paymentMethod.id,
            last4: paymentMethod.card!.last4,
            brand: paymentMethod.card!.brand,
            expMonth: paymentMethod.card!.exp_month,
            expYear: paymentMethod.card!.exp_year,
            isDefault: true,
          },
        });

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer = invoice.customer as string;
        
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customer },
        });

        if (user) {
          await db.payment.create({
            data: {
              userId: user.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "succeeded",
              stripeInvoiceId: invoice.id,
            },
          });
        }
        break;
      }

      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        const customer = paymentMethod.customer as string;
        
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customer },
        });

        if (user) {
          await db.paymentMethod.create({
            data: {
              userId: user.id,
              stripePaymentMethodId: paymentMethod.id,
              last4: paymentMethod.card!.last4,
              brand: paymentMethod.card!.brand,
              expMonth: paymentMethod.card!.exp_month,
              expYear: paymentMethod.card!.exp_year,
              isDefault: false,
            },
          });
        }
        break;
      }

      case "payment_method.updated": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        
        await db.paymentMethod.updateMany({
          where: { stripePaymentMethodId: paymentMethod.id },
          data: {
            last4: paymentMethod.card!.last4,
            brand: paymentMethod.card!.brand,
            expMonth: paymentMethod.card!.exp_month,
            expYear: paymentMethod.card!.exp_year,
          },
        });
        break;
      }

      case "payment_method.detached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        
        await db.paymentMethod.deleteMany({
          where: { stripePaymentMethodId: paymentMethod.id },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = subscription.customer as string;
        
        await db.user.updateMany({
          where: {
            stripeCustomerId: customer,
          },
          data: {
            subscriptionStatus: subscription.status,
            subscriptionTier: subscription.status === "active" ? "pro" : "free",
            subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = subscription.customer as string;
        
        await db.user.updateMany({
          where: {
            stripeCustomerId: customer,
          },
          data: {
            subscriptionStatus: "canceled",
            subscriptionTier: "free",
            subscriptionPeriodEnd: null,
          },
        });
        break;
      }
    }

    return json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
