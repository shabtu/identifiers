import { validateBankgiro } from "../src/bankgiro";

describe("bankgiro", () => {
  test("valid 7-digit bankgiro", () => {
    const r = validateBankgiro("524-0007");
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe("524-0007");
  });

  test("valid 8-digit bankgiro", () => {
    const r = validateBankgiro("5050-1055");
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe("5050-1055");
  });

  test("invalid checksum", () => {
    expect(validateBankgiro("739-0148").valid).toBe(false);
  });
});
