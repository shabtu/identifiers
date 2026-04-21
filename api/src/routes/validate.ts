import { FastifyInstance } from "fastify";
import { requireApiKey } from "../middleware/auth";
import {
  validatePersonnummer,
  validateOrgnummer,
  validateBankgiro,
  validatePlusgiro,
  validateKontonummer,
  validateIBAN,
} from "../../../dist";

const VALIDATORS = {
  personnummer: validatePersonnummer,
  orgnummer: validateOrgnummer,
  bankgiro: validateBankgiro,
  plusgiro: validatePlusgiro,
  kontonummer: validateKontonummer,
  iban: validateIBAN,
} as const;

type ValidatorKey = keyof typeof VALIDATORS;

export default async function validateRoutes(app: FastifyInstance) {
  for (const [name, fn] of Object.entries(VALIDATORS)) {
    app.post<{ Body: { value: string } }>(
      `/v1/validate/${name}`,
      { preHandler: requireApiKey },
      async (req, reply) => {
        const { value } = req.body ?? {};
        if (typeof value !== "string" || value.trim() === "") {
          return reply.code(400).send({ error: 'Body must be JSON with a "value" string field.' });
        }
        const result = fn(value as any);
        return reply.send(result);
      }
    );
  }

  // Batch endpoint — validate multiple identifiers in one request
  app.post<{ Body: { items: { type: ValidatorKey; value: string }[] } }>(
    "/v1/validate/batch",
    { preHandler: requireApiKey },
    async (req, reply) => {
      const { items } = req.body ?? {};
      if (!Array.isArray(items) || items.length === 0) {
        return reply.code(400).send({ error: 'Body must be JSON with an "items" array.' });
      }
      if (items.length > 50) {
        return reply.code(400).send({ error: "Batch limit is 50 items per request." });
      }
      const results = items.map(({ type, value }) => {
        const fn = VALIDATORS[type];
        if (!fn) return { type, value, error: `Unknown type "${type}"` };
        return { type, value, result: fn(value as any) };
      });
      return reply.send({ results });
    }
  );
}
