export interface KontonummerResult {
  valid: boolean;
  clearing: string | null;
  account: string | null;
  bank: string | null;
}

// Swedish clearing number ranges mapped to bank names (non-exhaustive)
const CLEARING_RANGES: [number, number, string][] = [
  [1100, 1199, "Nordea"],
  [1200, 1399, "Danske Bank"],
  [1400, 2099, "Nordea"],
  [2300, 2399, "JP Nordiska"],
  [2400, 2499, "Ålandsbanken"],
  [3000, 3299, "Nordea"],
  [3300, 3300, "Swedbank"],
  [3301, 3399, "Nordea"],
  [3400, 3409, "Länsförsäkringar Bank"],
  [3410, 3781, "Nordea"],
  [3782, 3782, "Länsförsäkringar Bank"],
  [3783, 3999, "Nordea"],
  [4000, 4999, "Swedbank"],
  [5000, 5999, "SEB"],
  [6000, 6999, "Handelsbanken"],
  [7000, 7999, "Swedbank"],
  [8000, 8999, "Swedbank"],
  [9020, 9029, "Länsförsäkringar Bank"],
  [9040, 9049, "Citibank"],
  [9060, 9069, "Länsförsäkringar Bank"],
  [9090, 9099, "Royal Bank of Scotland"],
  [9100, 9109, "Nordnet"],
  [9120, 9124, "SEB"],
  [9130, 9149, "SEB"],
  [9150, 9169, "Skandiabanken"],
  [9170, 9179, "Ikano Bank"],
  [9180, 9189, "Danske Bank"],
  [9190, 9199, "Den Norske Bank"],
  [9230, 9239, "Marginalen Bank"],
  [9250, 9259, "SBAB"],
  [9260, 9269, "Den Norske Bank"],
  [9270, 9279, "ICA Banken"],
  [9280, 9289, "Resurs Bank"],
  [9300, 9349, "Sparbanken Syd"],
  [9400, 9449, "Forex Bank"],
  [9460, 9469, "GE Money Bank"],
  [9470, 9479, "Fortis Bank"],
  [9500, 9549, "Plusgirot / Nordea"],
  [9550, 9569, "Avanza"],
  [9570, 9579, "Sparbanken Öresund"],
  [9580, 9589, "Santander Consumer Bank"],
  [9590, 9599, "Erik Penser Bankaktiebolag"],
  [9630, 9639, "Lån & Spar Bank Sverige"],
  [9640, 9649, "Nordax Bank"],
  [9650, 9659, "MedMera Bank"],
  [9660, 9669, "Svea Bank"],
  [9670, 9679, "JAK Medlemsbank"],
  [9680, 9689, "Bluestep Bolån"],
  [9690, 9699, "Hoist Kredit"],
  [9700, 9709, "Ekobanken"],
  [9710, 9719, "TF Bank"],
  [9720, 9729, "Bambora"],
  [9730, 9739, "Landshypotek"],
  [9740, 9749, "Collector"],
  [9750, 9759, "Sparbanken Syd"],
  [9760, 9769, "Klarna Bank"],
  [9780, 9789, "Qliro"],
  [9790, 9799, "Marginalen Bank"],
  [9880, 9899, "Riksgälden"],
  [9960, 9969, "Nordea"],
];

function lookupBank(clearing: number): string | null {
  for (const [lo, hi, name] of CLEARING_RANGES) {
    if (clearing >= lo && clearing <= hi) return name;
  }
  return null;
}

// Format: CCCC XXXXXXXXX (clearing 4 digits + account up to 10 digits)
const RE = /^(\d{4,5})[-\s]?(\d{1,10})$/;

export function validateKontonummer(input: string): KontonummerResult {
  const fail: KontonummerResult = { valid: false, clearing: null, account: null, bank: null };
  const s = input.replace(/\s+/g, " ").trim();
  const m = RE.exec(s.replace(/\s/g, ""));
  if (!m) return fail;

  const [, clearing, account] = m;
  const clearingNum = parseInt(clearing.slice(0, 4), 10);
  const bank = lookupBank(clearingNum);
  if (!bank) return fail;

  return {
    valid: true,
    clearing: clearing.slice(0, 4),
    account,
    bank,
  };
}
