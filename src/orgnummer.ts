import { luhn } from "./luhn";

export interface OrgnummerResult {
  valid: boolean;
  normalized: string | null;
  entity_type: string | null;
}

// Swedish entity type codes (1st digit of orgnummer)
const ENTITY_TYPES: Record<number, string> = {
  1: "Dödsbon (estate)",
  2: "State/municipality/region",
  3: "Foreign company",
  5: "Aktiebolag (AB)",
  6: "Enkelt bolag / Enskild firma",
  7: "Ekonomisk förening / Bostadsrättsförening",
  8: "Ideell förening / Stiftelse",
  9: "Handelsbolag / Kommanditbolag",
};

// Format: XXXXXX-XXXX or XXXXXXXXXX (10 digits)
// 3rd digit must be >= 2
const RE = /^(\d{6})[-]?(\d{4})$/;

export function validateOrgnummer(input: string): OrgnummerResult {
  const fail: OrgnummerResult = { valid: false, normalized: null, entity_type: null };

  const s = input.replace(/\s/g, "");
  const m = RE.exec(s);
  if (!m) return fail;

  const [, first6, last4] = m;
  const tenDigits = first6 + last4;

  // 3rd digit must be 2 or higher
  const thirdDigit = parseInt(tenDigits[2], 10);
  if (thirdDigit < 2) return fail;

  if (!luhn(tenDigits)) return fail;

  const firstDigit = parseInt(tenDigits[0], 10);
  const entity_type = ENTITY_TYPES[firstDigit] ?? "Unknown";

  return {
    valid: true,
    normalized: `${first6}-${last4}`,
    entity_type,
  };
}
