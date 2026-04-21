export interface IBANResult {
  valid: boolean;
  normalized: string | null;
  country: string | null;
  check_digits: string | null;
  bban: string | null;
}

// ISO 13616 IBAN validation via mod-97
export function validateIBAN(input: string): IBANResult {
  const fail: IBANResult = { valid: false, normalized: null, country: null, check_digits: null, bban: null };

  const s = input.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) return fail;

  const country = s.slice(0, 2);
  const checkDigits = s.slice(2, 4);
  const bban = s.slice(4);

  // Swedish IBAN: SE + 2 check digits + 20 BBAN digits (clearing 4 + account 10 + check 1 = hmm, actually SE is 24 chars total)
  // General: rearrange to BBAN + country + check, convert letters to numbers, mod 97 must equal 1
  const rearranged = bban + country + checkDigits;
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));

  // BigInt mod
  let remainder = BigInt(0);
  for (const ch of numeric) {
    remainder = (remainder * 10n + BigInt(parseInt(ch, 10))) % 97n;
  }

  if (remainder !== 1n) return fail;

  // Format with spaces every 4 chars
  const normalized = s.replace(/(.{4})/g, "$1 ").trim();

  return { valid: true, normalized, country, check_digits: checkDigits, bban };
}
