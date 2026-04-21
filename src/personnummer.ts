import { luhn } from "./luhn";

export interface PersonnummerResult {
  valid: boolean;
  type: "personnummer" | "samordningsnummer" | null;
  normalized: string | null;
  century: string | null;
  year: string | null;
  month: string | null;
  day: string | null;
  birth_number: string | null;
  check_digit: string | null;
  age: number | null;
  is_male: boolean | null;
}

// Accepts formats:
//   YYYYMMDDXXXX  (12 digits)
//   YYMMDD-XXXX   (10 digits with -)
//   YYMMDD+XXXX   (10 digits with +, born >100 years ago)
//   YYMMDDXXXX    (10 digits, no separator)
const RE = /^(\d{2})?(\d{2})(\d{2})(\d{2})([-+]?)(\d{3})(\d)$/;

export function validatePersonnummer(input: string): PersonnummerResult {
  const fail: PersonnummerResult = {
    valid: false, type: null, normalized: null,
    century: null, year: null, month: null, day: null,
    birth_number: null, check_digit: null, age: null, is_male: null,
  };

  const s = input.replace(/\s/g, "");
  const m = RE.exec(s);
  if (!m) return fail;

  let [, centuryPrefix, yy, mm, dd, sep, birth, check] = m;

  const dayNum = parseInt(dd, 10);
  const isSamordning = dayNum >= 61 && dayNum <= 91;
  const realDay = isSamordning ? dayNum - 60 : dayNum;
  if (!isSamordning && (realDay < 1 || realDay > 31)) return fail;

  const monthNum = parseInt(mm, 10);
  if (monthNum < 1 || monthNum > 12) return fail;

  let century: string;
  let fullYear: number;

  if (centuryPrefix) {
    century = centuryPrefix;
    fullYear = parseInt(centuryPrefix + yy, 10);
  } else {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100);
    const pivot = currentYear % 100;
    let yearNum = parseInt(yy, 10);
    if (sep === "+") {
      // born more than 100 years ago
      fullYear = (currentCentury - 1) * 100 + yearNum;
    } else {
      fullYear = yearNum <= pivot
        ? currentCentury * 100 + yearNum
        : (currentCentury - 1) * 100 + yearNum;
    }
    century = String(Math.floor(fullYear / 100));
  }

  // Luhn check on 10-digit number (without separator): YYMMDDXXXC
  const tenDigits = `${yy}${mm}${dd}${birth}${check}`;
  if (!luhn(tenDigits)) return fail;

  const birthNum = parseInt(birth, 10);
  const is_male = birthNum % 2 !== 0;

  const birthDate = new Date(fullYear, monthNum - 1, realDay);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return {
    valid: true,
    type: isSamordning ? "samordningsnummer" : "personnummer",
    normalized: `${century}${yy}${mm}${dd}-${birth}${check}`,
    century,
    year: `${century}${yy}`,
    month: mm,
    day: String(realDay).padStart(2, "0"),
    birth_number: birth,
    check_digit: check,
    age,
    is_male,
  };
}
