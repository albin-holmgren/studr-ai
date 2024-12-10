import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const PLANS = {
  FREE: {
    name: "Free",
    description: "10,000 AI tokens per day",
    features: [
      "10,000 AI tokens daily limit",
      "Basic document editing",
      "Search functionality",
      "Archive management",
    ],
    price: 0,
  },
  PRO: {
    name: "Pro",
    description: "Unlimited AI tokens",
    features: [
      "Unlimited AI tokens",
      "Priority support",
      "Advanced document editing",
      "Enhanced search capabilities",
      "Full archive access",
    ],
    monthlyPriceId: "price_1Q9XcEEi4TbYsJmMmVzFxVxL",
    yearlyPriceId: "price_1Q9XcEEi4TbYsJmMnXzFxVxM",
    monthlyPrice: 21,
    yearlyPrice: 17,
  },
};
