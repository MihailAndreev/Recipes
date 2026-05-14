"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getRecipe, removeRecipePhoto, updateRecipe, uploadRecipePhoto } from "@/lib/client-api";
import type { Recipe, RecipePayload } from "@/types/recipes";

import { useAuth } from "./AuthProvider";
import { RecipeForm } from "./RecipeForm";

export function EditRecipePage({ id }: { id: number }) {
  const router = useRouter();
  const { loading: authLoading, token, user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecipe(id)
      .then((response) => setRecipe(response.data))
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload: RecipePayload, photoFile: File | null, removePhoto: boolean) {
    const response = await updateRecipe(id, payload, token);
    if (photoFile) {
      await uploadRecipePhoto(response.data.id, photoFile, token);
    } else if (removePhoto) {
      await removeRecipePhoto(response.data.id, token);
    }
    router.push(`/recipes/${response.data.id}`);
  }

  if (authLoading || loading) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-zinc-600">Loading recipe...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-semibold">Login required</h1>
          <p className="mt-2 text-zinc-600">Login before editing recipes.</p>
          <Link className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white" href="/login">
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-red-700">{error || "Recipe not found."}</main>;
  }

  if (recipe.userId !== user.id) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-red-700">You can only edit your own recipes.</main>;
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold">Edit Recipe</h1>
        <p className="mt-2 text-zinc-600">Update your recipe details.</p>
      </div>
      <RecipeForm initialRecipe={recipe} onSubmit={handleSubmit} submitLabel="Save changes" />
    </main>
  );
}
