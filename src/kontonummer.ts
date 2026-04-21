// Validation based on Bankgirot "Bankernas kontonummer" specification (2024-02-22)
// https://www.bankgirot.se/globalassets/dokument/anvandarmanualer/bankernaskontonummeruppbyggnad_anvandarmanual_sv.pdf

export interface KontonummerResult {
  valid: boolean;
  clearing: string | null;
  account: string | null;
  bank: string | null;
}

// Mod-11: weights 1,2,3,...,10 from right, repeating. Sum divisible by 11.
function mod11(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const weight = ((digits.length - 1 - i) % 10) + 1;
    sum += parseInt(digits[i], 10) * weight;
  }
  return sum % 11 === 0;
}

// Mod-10 (Luhn): weights alternate 2,1 from left; products >9 subtract 9. Sum divisible by 10.
function mod10(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

type ValidationType =
  | "type1_comment1"  // mod-11 on clearing[1..3] + account[7]  (10 digits)
  | "type1_comment2"  // mod-11 on clearing[0..3] + account[7]  (11 digits)
  | "type2_comment1"  // mod-10 on account[10] (clearing excluded)
  | "type2_comment2"  // mod-11 on account[9]  (clearing excluded, Handelsbanken)
  | "type2_comment3"; // mod-10 on account[10] (clearing excluded)

interface BankEntry {
  lo: number;
  hi: number;
  bank: string;
  type: ValidationType;
}

// Source: Bankgirot specification 2024-02-22
const BANKS: BankEntry[] = [
  // --- TYPE 1, comment 1 (mod-11, clearing excl. first digit + 7 account digits) ---
  { lo: 1100, hi: 1199, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 1200, hi: 1399, bank: "Danske Bank",                  type: "type1_comment1" },
  { lo: 1400, hi: 2099, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 2400, hi: 2499, bank: "Danske Bank",                  type: "type1_comment1" },
  { lo: 3000, hi: 3299, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 3301, hi: 3399, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 3400, hi: 3409, bank: "Länsförsäkringar Bank",        type: "type1_comment1" },
  { lo: 3410, hi: 3781, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 3783, hi: 3999, bank: "Nordea",                       type: "type1_comment1" },
  { lo: 5000, hi: 5999, bank: "SEB",                          type: "type1_comment1" },
  { lo: 7000, hi: 7999, bank: "Swedbank",                     type: "type1_comment1" },
  { lo: 9020, hi: 9029, bank: "Länsförsäkringar Bank",        type: "type1_comment1" },
  { lo: 9060, hi: 9069, bank: "Länsförsäkringar Bank",        type: "type1_comment1" },
  { lo: 9070, hi: 9079, bank: "Multitude Bank",               type: "type1_comment1" },
  { lo: 9120, hi: 9124, bank: "SEB",                          type: "type1_comment1" },
  { lo: 9130, hi: 9149, bank: "SEB",                          type: "type1_comment1" },
  { lo: 9170, hi: 9179, bank: "IKANO Bank",                   type: "type1_comment1" },
  { lo: 9230, hi: 9239, bank: "Marginalen Bank",              type: "type1_comment1" },
  { lo: 9250, hi: 9259, bank: "SBAB",                         type: "type1_comment1" },
  { lo: 9270, hi: 9279, bank: "ICA Banken",                   type: "type1_comment1" },
  { lo: 9280, hi: 9289, bank: "Resurs Bank",                  type: "type1_comment1" },
  { lo: 9460, hi: 9469, bank: "Santander Consumer Bank",      type: "type1_comment1" },
  { lo: 9580, hi: 9589, bank: "Aion Bank",                    type: "type1_comment1" },
  { lo: 9630, hi: 9639, bank: "Lån & Spar Bank Sverige",      type: "type1_comment1" },

  // --- TYPE 1, comment 2 (mod-11, all 4 clearing digits + 7 account digits) ---
  { lo: 2300, hi: 2399, bank: "Ålandsbanken",                 type: "type1_comment2" },
  { lo: 4000, hi: 4999, bank: "Nordea",                       type: "type1_comment2" },
  { lo: 9040, hi: 9049, bank: "Citibank",                     type: "type1_comment2" },
  { lo: 9100, hi: 9109, bank: "Nordnet Bank",                 type: "type1_comment2" },
  { lo: 9150, hi: 9169, bank: "Skandiabanken (Nordax)",       type: "type1_comment2" },
  { lo: 9190, hi: 9199, bank: "DNB Bank",                     type: "type1_comment2" },
  { lo: 9260, hi: 9269, bank: "DNB Bank",                     type: "type1_comment2" },
  { lo: 9390, hi: 9399, bank: "Landshypotek",                 type: "type1_comment2" },
  { lo: 9470, hi: 9479, bank: "BNP Paribas",                  type: "type1_comment2" },
  { lo: 9550, hi: 9569, bank: "Avanza Bank",                  type: "type1_comment2" },
  { lo: 9590, hi: 9599, bank: "Erik Penser Bank",             type: "type1_comment2" },
  { lo: 9640, hi: 9649, bank: "NOBA Bank Group",              type: "type1_comment2" },
  { lo: 9660, hi: 9669, bank: "Svea Bank",                    type: "type1_comment2" },
  { lo: 9670, hi: 9679, bank: "JAK Medlemsbank",              type: "type1_comment2" },
  { lo: 9680, hi: 9689, bank: "BlueStep Finans",              type: "type1_comment2" },
  { lo: 9700, hi: 9709, bank: "Ekobanken",                    type: "type1_comment2" },
  { lo: 9710, hi: 9719, bank: "Lunar Bank",                   type: "type1_comment2" },
  { lo: 9750, hi: 9759, bank: "Northmill Bank",               type: "type1_comment2" },
  { lo: 9780, hi: 9789, bank: "Klarna Bank",                  type: "type1_comment2" },
  { lo: 9880, hi: 9889, bank: "Riksgälden",                   type: "type1_comment2" },

  // --- TYPE 2, comment 1 (mod-10, 10-digit account, clearing excluded) ---
  { lo: 3300, hi: 3300, bank: "Nordea (personkonto)",         type: "type2_comment1" },
  { lo: 3782, hi: 3782, bank: "Nordea (personkonto)",         type: "type2_comment1" },
  { lo: 9180, hi: 9189, bank: "Danske Bank",                  type: "type2_comment1" },
  { lo: 9300, hi: 9349, bank: "Swedbank",                     type: "type2_comment1" },
  { lo: 9570, hi: 9579, bank: "Sparbanken Syd",               type: "type2_comment1" },
  { lo: 9890, hi: 9899, bank: "Riksgälden",                   type: "type2_comment1" },

  // --- TYPE 2, comment 2 (mod-11, 9-digit account, clearing excluded) ---
  { lo: 6000, hi: 6999, bank: "Handelsbanken",                type: "type2_comment2" },

  // --- TYPE 2, comment 3 (mod-10, 10-digit account, clearing excluded) ---
  { lo: 8000, hi: 8999, bank: "Swedbank",                     type: "type2_comment3" },
  { lo: 9500, hi: 9549, bank: "Nordea/Plusgirot",             type: "type2_comment3" },
  { lo: 9960, hi: 9969, bank: "Nordea/Plusgirot",             type: "type2_comment3" },
];

function lookupBank(clearing: number): BankEntry | null {
  return BANKS.find(b => clearing >= b.lo && clearing <= b.hi) ?? null;
}

function validate(clearing: string, account: string, entry: BankEntry): boolean {
  const c = clearing;
  const a = account;

  switch (entry.type) {
    case "type1_comment1": {
      // mod-11 on clearing[1..3] (3 digits) + account padded to 7 digits
      const digits = c.slice(1) + a.padStart(7, "0");
      return digits.length === 10 && mod11(digits);
    }
    case "type1_comment2": {
      // mod-11 on full clearing (4 digits) + account padded to 7 digits
      const digits = c + a.padStart(7, "0");
      return digits.length === 11 && mod11(digits);
    }
    case "type2_comment1":
    case "type2_comment3": {
      // mod-10 on account padded to 10 digits (clearing excluded)
      const digits = a.padStart(10, "0");
      return digits.length === 10 && mod10(digits);
    }
    case "type2_comment2": {
      // mod-11 on account padded to 9 digits (clearing excluded, Handelsbanken)
      const digits = a.padStart(9, "0");
      return digits.length === 9 && mod11(digits);
    }
  }
}

export function validateKontonummer(input: string): KontonummerResult {
  const fail: KontonummerResult = { valid: false, clearing: null, account: null, bank: null };

  // Strip spaces and common separators, allow optional dash between clearing and account
  const s = input.replace(/\s/g, "");
  const m = /^(\d{4,5})-?(\d{1,12})$/.exec(s);
  if (!m) return fail;

  // Swedbank 8xxx can be entered with a 5th digit as part of clearing — treat first 4 as clearing
  const clearing = m[1].slice(0, 4);
  const account = m[1].slice(4) + m[2]; // any 5th digit prepended to account

  const clearingNum = parseInt(clearing, 10);
  const entry = lookupBank(clearingNum);
  if (!entry) return fail;

  if (!validate(clearing, account, entry)) return fail;

  return {
    valid: true,
    clearing,
    account,
    bank: entry.bank,
  };
}
