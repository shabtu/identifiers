import { validateIBAN } from "../src/iban";

describe("IBAN", () => {
  test("valid Swedish IBAN", () => {
    const r = validateIBAN("SE4550000000058398257466");
    expect(r.valid).toBe(true);
    expect(r.country).toBe("SE");
  });

  test("valid with spaces", () => {
    const r = validateIBAN("SE45 5000 0000 0583 9825 7466");
    expect(r.valid).toBe(true);
  });

  test("invalid check digits", () => {
    expect(validateIBAN("SE9950000000058398257466").valid).toBe(false);
  });

  test("valid German IBAN", () => {
    const r = validateIBAN("DE89370400440532013000");
    expect(r.valid).toBe(true);
    expect(r.country).toBe("DE");
  });
});
