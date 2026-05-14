import { eq } from "drizzle-orm";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { errorResponse, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";
import { deleteRecipePhoto } from "@/lib/r2";
import { parseRecipeId, parseRecipeInput } from "@/lib/recipes";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid recipe id.");
  }

  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);

  if (!recipe) {
    return errorResponse("Recipe not found.", 404);
  }

  return Response.json({ data: recipe });
}

export async function PUT(request: Request, context: RouteContext) {
  const { response } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid recipe id.");
  }

  const body = await readJson(request);

  if (!body) {
    return errorResponse("Invalid JSON body.");
  }

  const { data, errors } = parseRecipeInput(body, true);

  if (errors.length > 0) {
    return errorResponse(errors.join(" "));
  }

  const [recipe] = await db.update(recipes).set(data).where(eq(recipes.id, id)).returning();

  if (!recipe) {
    return errorResponse("Recipe not found.", 404);
  }

  return Response.json({ data: recipe });
}

export async function PATCH(request: Request, context: RouteContext) {
  return PUT(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid recipe id.");
  }

  const [deletedRecipe] = await db.delete(recipes).where(eq(recipes.id, id)).returning();

  if (!deletedRecipe) {
    return errorResponse("Recipe not found.", 404);
  }

  await deleteRecipePhoto(deletedRecipe.photoUrl);

  return Response.json({ data: deletedRecipe });
}
