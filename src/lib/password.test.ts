import { hashPassword, verifyPassword } from "./password";

describe("password helpers", () => {
  it("hashes passwords without storing plaintext", async () => {
    const hashedPassword = await hashPassword("123456");

    expect(hashedPassword).not.toBe("123456");
    expect(hashedPassword).toMatch(/^\$2[aby]\$/);
  });

  it("verifies matching and non-matching passwords", async () => {
    const hashedPassword = await hashPassword("123456");

    await expect(verifyPassword("123456", hashedPassword)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hashedPassword)).resolves.toBe(false);
  });
});
