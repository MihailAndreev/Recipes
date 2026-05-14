import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { errorResponse, getString, readJson } from "@/lib/api";
import { createAuthCookie, signAuthToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);

  if (!body) {
    return errorResponse("Invalid JSON body.");
  }

  const email = getString(body.email).toLowerCase();
  const password = getString(body.password);

  const [userWithPassword] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!userWithPassword) {
    return errorResponse("Invalid email or password.", 401);
  }

  const isValidPassword = await verifyPassword(password, userWithPassword.password);

  if (!isValidPassword) {
    return errorResponse("Invalid email or password.", 401);
  }

  const user = {
    id: userWithPassword.id,
    email: userWithPassword.email,
    isAdmin: userWithPassword.isAdmin,
  };
  const token = signAuthToken(user);
  const response = Response.json({ user, token });
  response.headers.append("Set-Cookie", createAuthCookie(token));

  return response;
}
