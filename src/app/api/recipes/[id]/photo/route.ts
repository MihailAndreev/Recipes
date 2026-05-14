import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { deleteRecipePhoto, uploadRecipePhoto } from "@/lib/r2";
import { parseRecipeId } from "@/lib/recipes";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse("Unauthorized.", 401);
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid recipe id.");
  }

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
    .limit(1);

  if (!recipe) {
    return errorResponse("Recipe not found or not owned by current user.", 404);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid multipart form data.");
  }

  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return errorResponse("A photo file is required.");
  }

  try {
    const uploadedPhoto = await uploadRecipePhoto(id, file);
    await deleteRecipePhoto(recipe.photoUrl);

    const [updatedRecipe] = await db
      .update(recipes)
      .set({ photoUrl: uploadedPhoto.url })
      .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
      .returning();

    return Response.json({
      data: updatedRecipe,
      photoUrl: uploadedPhoto.url,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Photo upload failed.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse("Unauthorized.", 401);
  }

  const id = parseRecipeId(await context.params);

  if (!id) {
    return errorResponse("Invalid recipe id.");
  }

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
    .limit(1);

  if (!recipe) {
    return errorResponse("Recipe not found or not owned by current user.", 404);
  }

  try {
    await deleteRecipePhoto(recipe.photoUrl);
    const [updatedRecipe] = await db
      .update(recipes)
      .set({ photoUrl: null })
      .where(and(eq(recipes.id, id), eq(recipes.userId, user.id)))
      .returning();

    return Response.json({ data: updatedRecipe, photoUrl: null });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Photo delete failed.", 500);
  }
}
