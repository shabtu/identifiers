import { validateOrgnummer } from "../src/orgnummer";

describe("orgnummer", () => {
  test("valid AB orgnummer", () => {
    const r = validateOrgnummer("556614-3185");
    expect(r.valid).toBe(true);
    expect(r.entity_type).toBe("Aktiebolag (AB)"); // first digit 5 = AB
    expect(r.normalized).toBe("556614-3185");
  });

  test("valid without separator", () => {
    expect(validateOrgnummer("5566143185").valid).toBe(true);
  });

  test("invalid checksum", () => {
    expect(validateOrgnummer("556614-3186").valid).toBe(false);
  });

  test("invalid: 3rd digit < 2", () => {
    expect(validateOrgnummer("110000-0000").valid).toBe(false);
  });
});
