import { getOptionalString, getPositiveInteger, getString, getStringArray, isRecord } from "./api";

export type RecipeInput = {
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  servings: number;
  tags: string[];
  photoUrl: string | null;
};

export function parseRecipeInput(body: Record<string, unknown>, partial = false) {
  const result: Partial<RecipeInput> = {};
  const errors: string[] = [];

  if (!partial || "title" in body) {
    const title = getString(body.title);
    if (title) {
      result.title = title;
    } else {
      errors.push("title is required.");
    }
  }

  if (!partial || "description" in body) {
    result.description = getOptionalString(body.description);
  }

  if (!partial || "ingredients" in body) {
    const ingredients = getString(body.ingredients);
    if (ingredients) {
      result.ingredients = ingredients;
    } else {
      errors.push("ingredients is required.");
    }
  }

  if (!partial || "instructions" in body) {
    const instructions = getString(body.instructions);
    if (instructions) {
      result.instructions = instructions;
    } else {
      errors.push("instructions is required.");
    }
  }

  if (!partial || "cookingTime" in body || "cooking_time" in body) {
    const cookingTime = getPositiveInteger(body.cookingTime ?? body.cooking_time);
    if (cookingTime) {
      result.cookingTime = cookingTime;
    } else {
      errors.push("cookingTime must be a positive integer.");
    }
  }

  if (!partial || "servings" in body) {
    const servings = getPositiveInteger(body.servings);
    if (servings) {
      result.servings = servings;
    } else {
      errors.push("servings must be a positive integer.");
    }
  }

  if (!partial || "tags" in body) {
    const tags = getStringArray(body.tags);
    if (tags) {
      result.tags = tags;
    } else {
      errors.push("tags must be an array of strings.");
    }
  }

  if ("photoUrl" in body || "photo_url" in body) {
    result.photoUrl = getOptionalString(body.photoUrl ?? body.photo_url);
  }

  if (partial && Object.keys(result).length === 0 && errors.length === 0) {
    errors.push("At least one recipe field is required.");
  }

  return {
    data: result,
    errors,
  };
}

export function parseRecipeId(params: Record<string, unknown>) {
  if (!isRecord(params)) {
    return null;
  }

  const id = getPositiveInteger(params.id);
  return id;
}
