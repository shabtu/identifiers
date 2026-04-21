export interface PlusgiroResult {
  valid: boolean;
  normalized: string | null;
}

// Plusgiro: 2–8 digits before separator + 1 check digit, separated by "-"
// Total 3–9 digits, Luhn validated
const RE = /^(\d{1,7})-?(\d)$/;

export function validatePlusgiro(input: string): PlusgiroResult {
  const fail: PlusgiroResult = { valid: false, normalized: null };
  const s = input.replace(/\s/g, "");
  const m = RE.exec(s);
  if (!m) return fail;

  const digits = m[1] + m[2];
  if (digits.length < 2 || digits.length > 8) return fail;
  if (!luhnMod10(digits)) return fail;

  return {
    valid: true,
    normalized: `${m[1]}-${m[2]}`,
  };
}

function luhnMod10(digits: string): boolean {
  let sum = 0;
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    let n = parseInt(digits[i], 10);
    if ((len - i) % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}
