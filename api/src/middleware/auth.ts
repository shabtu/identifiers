import { FastifyRequest, FastifyReply } from "fastify";
import { lookupKey, checkAndIncrementUsage } from "../db/keys";

export async function requireApiKey(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers["authorization"] ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7) : (req.headers["x-api-key"] as string);

  if (!key) {
    reply.code(401).send({ error: "Missing API key. Pass it as Authorization: Bearer <key> or X-Api-Key header." });
    return;
  }

  const record = lookupKey(key);
  if (!record) {
    reply.code(401).send({ error: "Invalid API key." });
    return;
  }

  const usage = checkAndIncrementUsage(key, record.tier);
  if (!usage.allowed) {
    reply.code(429).send({
      error: "Daily limit reached.",
      used: usage.used,
      limit: usage.limit,
      upgrade: `${process.env.API_BASE_URL ?? ""}/v1/billing/checkout`,
    });
    return;
  }

  // Attach for downstream handlers
  (req as any).apiKey = key;
  (req as any).tier = record.tier;

  if (usage.limit !== null) {
    reply.header("X-RateLimit-Limit", String(usage.limit));
    reply.header("X-RateLimit-Remaining", String(usage.limit - usage.used));
  }
}
