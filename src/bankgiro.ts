export interface BankgiroResult {
  valid: boolean;
  normalized: string | null;
}

// Bankgiro: 7 or 8 digits, formatted as NNN-NNNN or NNNN-NNNN
// Validated with Luhn (mod 10) on all digits
const RE = /^(\d{3,4})[-]?(\d{4})$/;

export function validateBankgiro(input: string): BankgiroResult {
  const fail: BankgiroResult = { valid: false, normalized: null };
  const s = input.replace(/\s/g, "");
  const m = RE.exec(s);
  if (!m) return fail;

  const digits = m[1] + m[2];
  if (!luhnMod10(digits)) return fail;

  const sep = digits.length === 7 ? 3 : 4;
  return {
    valid: true,
    normalized: `${digits.slice(0, sep)}-${digits.slice(sep)}`,
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
