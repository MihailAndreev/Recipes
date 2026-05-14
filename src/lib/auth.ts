import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authCookieName = "auth_token";

export type AuthUser = {
  id: number;
  email: string;
};

type TokenPayload = JwtPayload & {
  userId?: number;
  email?: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

export async function getAuthToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  const cookieStore = await cookies();
  return cookieStore.get(authCookieName)?.value ?? null;
}

export async function getCurrentUser(request: Request) {
  const token = await getAuthToken(request);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as TokenPayload;

    if (typeof payload.userId !== "number") {
      return null;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function createAuthCookie(token: string) {
  const options = getAuthCookieOptions();
  const secure = options.secure ? "; Secure" : "";

  return `${authCookieName}=${token}; HttpOnly; Path=${options.path}; SameSite=Lax; Max-Age=${options.maxAge}${secure}`;
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${authCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}
