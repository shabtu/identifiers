import { validatePersonnummer } from "../src/personnummer";

describe("personnummer", () => {
  test("valid 10-digit personnummer", () => {
    const r = validatePersonnummer("811228-9874");
    expect(r.valid).toBe(true);
    expect(r.type).toBe("personnummer");
    expect(r.age).toBeGreaterThan(0);
    expect(r.is_male).toBe(true); // birth number 987 is odd → male
  });

  test("valid 12-digit personnummer", () => {
    const r = validatePersonnummer("198112289874");
    expect(r.valid).toBe(true);
    expect(r.normalized).toBe("19811228-9874");
  });

  test("valid samordningsnummer (day +60)", () => {
    const r = validatePersonnummer("701063-2391");
    expect(r.valid).toBe(true);
    expect(r.type).toBe("samordningsnummer");
    expect(r.day).toBe("03");
  });

  test("invalid checksum", () => {
    expect(validatePersonnummer("811228-9875").valid).toBe(false);
  });

  test("invalid month", () => {
    expect(validatePersonnummer("811398-0000").valid).toBe(false);
  });

  test("plus sign means born >100 years ago", () => {
    const r = validatePersonnummer("121212+1212");
    expect(r.valid).toBe(true);
    const year = parseInt(r.year!);
    expect(year).toBeLessThan(1930);
  });
});
