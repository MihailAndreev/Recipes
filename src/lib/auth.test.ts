import jwt from "jsonwebtoken";

import { createAuthCookie, getAuthCookieOptions, getCurrentUser, signAuthToken } from "./auth";

const limit = jest.fn();
const where = jest.fn(() => ({ limit }));
const from = jest.fn(() => ({ where }));
const select = jest.fn(() => ({ from }));
const cookieGet = jest.fn();
const cookiesMock = jest.fn(() =>
  Promise.resolve({
    get: cookieGet,
  }),
);

jest.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => select(...args),
  },
}));

jest.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

describe("auth helpers", () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
    jest.clearAllMocks();
    limit.mockResolvedValue([{ id: 7, email: "ivan@abv.bg" }]);
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("generates a JWT containing the user id and email", () => {
    const token = signAuthToken({ id: 7, email: "ivan@abv.bg" });
    const payload = jwt.verify(token, "test-secret");

    expect(payload).toMatchObject({
      userId: 7,
      email: "ivan@abv.bg",
    });
  });

  it("throws when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;

    expect(() => signAuthToken({ id: 7, email: "ivan@abv.bg" })).toThrow(
      "JWT_SECRET is not configured.",
    );
  });

  it("verifies a bearer token and loads the current user from mocked DB", async () => {
    const token = signAuthToken({ id: 7, email: "ivan@abv.bg" });
    const request = new Request("http://localhost/api/auth/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    await expect(getCurrentUser(request)).resolves.toEqual({
      id: 7,
      email: "ivan@abv.bg",
    });
    expect(select).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(1);
  });

  it("returns null for invalid tokens", async () => {
    const request = new Request("http://localhost/api/auth/me", {
      headers: {
        authorization: "Bearer invalid-token",
      },
    });

    await expect(getCurrentUser(request)).resolves.toBeNull();
    expect(select).not.toHaveBeenCalled();
  });

  it("reads token from cookies when bearer token is missing", async () => {
    const token = signAuthToken({ id: 7, email: "ivan@abv.bg" });
    cookieGet.mockReturnValue({ value: token });

    await expect(getCurrentUser(new Request("http://localhost/api/auth/me"))).resolves.toEqual({
      id: 7,
      email: "ivan@abv.bg",
    });
    expect(cookiesMock).toHaveBeenCalled();
  });

  it("creates secure cookie options in production", () => {
    process.env.NODE_ENV = "production";

    expect(getAuthCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    expect(createAuthCookie("token")).toContain("; Secure");
  });
});
