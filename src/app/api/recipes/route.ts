import { and, arrayContains, count, desc, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { errorResponse, getPositiveInteger, getString, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { parseRecipeInput } from "@/lib/recipes";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = getPositiveInteger(searchParams.get("page")) ?? 1;
  const pageSize = Math.min(getPositiveInteger(searchParams.get("pageSize")) ?? 10, 50);
  const tag = getString(searchParams.get("tag")).toLowerCase();
  const search = getString(searchParams.get("search"));

  const filters = [
    tag ? arrayContains(recipes.tags, [tag]) : undefined,
    search
      ? or(
          ilike(recipes.title, `%${search}%`),
          ilike(recipes.description, `%${search}%`),
          ilike(recipes.ingredients, `%${search}%`),
          ilike(recipes.instructions, `%${search}%`),
        )
      : undefined,
  ].filter(Boolean);
  const where = filters.length > 0 ? and(...filters) : undefined;
  const offset = (page - 1) * pageSize;

  const [items, totalRows] = await Promise.all([
    db.select().from(recipes).where(where).orderBy(desc(recipes.dateCreated)).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(recipes).where(where),
  ]);
  const total = totalRows[0]?.value ?? 0;

  return Response.json({
    data: items,
    paging: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse("Unauthorized.", 401);
  }

  const body = await readJson(request);

  if (!body) {
    return errorResponse("Invalid JSON body.");
  }

  const { data, errors } = parseRecipeInput(body);

  if (errors.length > 0) {
    return errorResponse(errors.join(" "));
  }

  const [recipe] = await db
    .insert(recipes)
    .values({
      userId: user.id,
      title: data.title!,
      description: data.description ?? null,
      ingredients: data.ingredients!,
      instructions: data.instructions!,
      cookingTime: data.cookingTime!,
      servings: data.servings!,
      tags: data.tags!,
      photoUrl: data.photoUrl ?? null,
    })
    .returning();

  return Response.json({ data: recipe }, { status: 201 });
}
