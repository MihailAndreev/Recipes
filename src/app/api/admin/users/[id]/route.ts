import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { errorResponse, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";
import { normalizeEmail, validateEmail } from "@/lib/auth-validation";
import { parseRecipeId } from "@/lib/recipes";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { response, user: adminUser } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid user id.");
  }

  const body = await readJson(request);

  if (!body) {
    return errorResponse("Invalid JSON body.");
  }

  const updates: {
    email?: string;
    isAdmin?: boolean;
  } = {};

  if ("email" in body) {
    const email = normalizeEmail(body.email);

    if (!validateEmail(email)) {
      return errorResponse("A valid email is required.");
    }

    updates.email = email;
  }

  if ("isAdmin" in body || "is_admin" in body) {
    const isAdmin = body.isAdmin ?? body.is_admin;

    if (typeof isAdmin !== "boolean") {
      return errorResponse("isAdmin must be a boolean.");
    }

    if (adminUser?.id === id && !isAdmin) {
      return errorResponse("You cannot remove your own admin access.", 400);
    }

    updates.isAdmin = isAdmin;
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse("At least one user field is required.");
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
      });

    if (!updatedUser) {
      return errorResponse("User not found.", 404);
    }

    return Response.json({ data: updatedUser });
  } catch {
    return errorResponse("User could not be updated.", 400);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response, user: adminUser } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid user id.");
  }

  if (adminUser?.id === id) {
    return errorResponse("You cannot delete your own user account.", 400);
  }

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      isAdmin: users.isAdmin,
    });

  if (!deletedUser) {
    return errorResponse("User not found.", 404);
  }

  return Response.json({ data: deletedUser });
}
