import { normalizeEmail, validateAuthInput, validateEmail, validatePassword } from "./auth-validation";

describe("auth validation", () => {
  it("normalizes email input", () => {
    expect(normalizeEmail("  IVAN@ABV.BG  ")).toBe("ivan@abv.bg");
  });

  it("validates email format", () => {
    expect(validateEmail("ivan@abv.bg")).toBe(true);
    expect(validateEmail("ivan@")).toBe(false);
    expect(validateEmail("not-an-email")).toBe(false);
  });

  it("validates password length", () => {
    expect(validatePassword("123456")).toBe(true);
    expect(validatePassword("12345")).toBe(false);
  });

  it("returns parsed values and errors for invalid auth input", () => {
    const result = validateAuthInput({
      email: "bad-email",
      password: "123",
    });

    expect(result.email).toBe("bad-email");
    expect(result.password).toBe("123");
    expect(result.errors).toEqual([
      "A valid email is required.",
      "Password must be at least 6 characters.",
    ]);
  });

  it("accepts valid auth input", () => {
    const result = validateAuthInput({
      email: "  GO6O@ABV.BG ",
      password: "123456",
    });

    expect(result).toEqual({
      email: "go6o@abv.bg",
      password: "123456",
      errors: [],
    });
  });
});
