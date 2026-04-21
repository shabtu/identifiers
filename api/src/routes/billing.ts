import { FastifyInstance, FastifyRequest } from "fastify";
import { createCheckoutSession, handleWebhook } from "../billing/stripe";
import { createKey, getUsage } from "../db/keys";
import { requireApiKey } from "../middleware/auth";

export default async function billingRoutes(app: FastifyInstance) {
  // Start a Stripe Checkout session (Pro plan)
  app.post<{ Body: { email: string } }>("/v1/billing/checkout", async (req, reply) => {
    const { email } = req.body ?? {};
    if (!email || !email.includes("@")) {
      return reply.code(400).send({ error: "Valid email required." });
    }
    try {
      const url = await createCheckoutSession(email);
      return reply.send({ url });
    } catch (err: any) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // Free tier key — no payment required, rate limited
  app.post<{ Body: { email: string } }>("/v1/keys/free", async (req, reply) => {
    const { email } = req.body ?? {};
    if (!email || !email.includes("@")) {
      return reply.code(400).send({ error: "Valid email required." });
    }
    const key = createKey(email, "free");
    return reply.code(201).send({
      key,
      tier: "free",
      daily_limit: 100,
      note: "Keep this key secret. Upgrade at /v1/billing/checkout.",
    });
  });

  // Usage stats for the authenticated key
  app.get("/v1/usage", { preHandler: requireApiKey }, async (req, reply) => {
    const key = (req as any).apiKey as string;
    const tier = (req as any).tier as string;
    const rows = getUsage(key);
    return reply.send({ tier, last_30_days: rows });
  });

  // Stripe webhook — must receive raw body
  app.post(
    "/v1/billing/webhook",
    {},
    async (req: FastifyRequest & { rawBody?: Buffer }, reply) => {
      const sig = req.headers["stripe-signature"] as string;
      if (!sig || !req.rawBody) {
        return reply.code(400).send({ error: "Missing signature or body." });
      }
      try {
        await handleWebhook(req.rawBody, sig);
        return reply.send({ received: true });
      } catch (err: any) {
        return reply.code(400).send({ error: err.message });
      }
    }
  );

  app.get("/v1/billing/success", async (_req, reply) => {
    return reply.send({
      message: "Payment successful. Check your email for your API key.",
    });
  });

  app.get("/v1/billing/cancel", async (_req, reply) => {
    return reply.code(200).send({ message: "Checkout cancelled." });
  });
}
