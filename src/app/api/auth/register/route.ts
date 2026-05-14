import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { errorResponse, readJson } from "@/lib/api";
import { validateAuthInput } from "@/lib/auth-validation";
import { createAuthCookie, signAuthToken } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);

  if (!body) {
    return errorResponse("Invalid JSON body.");
  }

  const { email, errors, password } = validateAuthInput(body);

  if (errors.length > 0) {
    return errorResponse(errors.join(" "));
  }

  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    return errorResponse("A user with this email already exists.", 409);
  }

  const hashedPassword = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
    })
    .returning({
      id: users.id,
      email: users.email,
      isAdmin: users.isAdmin,
    });

  const token = signAuthToken(user);
  const response = Response.json({ user, token }, { status: 201 });
  response.headers.append("Set-Cookie", createAuthCookie(token));

  return response;
}
