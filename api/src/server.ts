import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import validateRoutes from "./routes/validate";
import billingRoutes from "./routes/billing";

const app = Fastify({
  logger: true,
  bodyLimit: 1048576, // 1 MB
});

// Capture raw body for Stripe webhook verification
app.addContentTypeParser("application/json", { parseAs: "buffer" }, (req, body, done) => {
  (req as any).rawBody = body;
  try {
    done(null, JSON.parse(body.toString()));
  } catch (e: any) {
    done(e, undefined);
  }
});

// IP-level rate limit as a global safety net (separate from per-key limits)
app.register(rateLimit, {
  max: 300,
  timeWindow: "1 minute",
  errorResponseBuilder: () => ({
    error: "Too many requests from this IP. Slow down.",
  }),
});

app.get("/", async () => ({
  name: "Swedish Identifiers API",
  docs: "https://github.com/shabtu/identifiers",
  endpoints: [
    "POST /v1/validate/personnummer",
    "POST /v1/validate/orgnummer",
    "POST /v1/validate/bankgiro",
    "POST /v1/validate/plusgiro",
    "POST /v1/validate/kontonummer",
    "POST /v1/validate/iban",
    "POST /v1/validate/batch",
    "POST /v1/keys/free",
    "POST /v1/billing/checkout",
    "GET  /v1/usage",
  ],
}));

app.register(validateRoutes);
app.register(billingRoutes);

const port = parseInt(process.env.PORT ?? "3000", 10);

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
