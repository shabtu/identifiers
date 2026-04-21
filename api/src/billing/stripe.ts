import Stripe from "stripe";
import { createKey, upgradeKey, downgradeKey } from "../db/keys";

let _stripe: Stripe | null = null;

function stripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  }
  return _stripe;
}

// Create a Stripe Checkout session — user pays, then gets their API key via webhook
export async function createCheckoutSession(email: string): Promise<string> {
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRO_PRICE_ID not set");

  const base = process.env.API_BASE_URL ?? "http://localhost:3000";

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/v1/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/v1/billing/cancel`,
    metadata: { email },
  });

  return session.url!;
}

// Handle Stripe webhook events
export async function handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

  const event = stripe().webhooks.constructEvent(rawBody, signature, secret);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email ?? session.customer_email ?? "";
      const stripeId = session.subscription as string;
      createKey(email, "pro", stripeId);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      downgradeKey(sub.id);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "active") upgradeKey(sub.id);
      else downgradeKey(sub.id);
      break;
    }
  }
}
