"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { deleteRecipe, getRecipe } from "@/lib/client-api";
import type { Recipe } from "@/types/recipes";

import { useAuth } from "./AuthProvider";

export function RecipeDetail({ id }: { id: number }) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getRecipe(id)
      .then((response) => setRecipe(response.data))
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!recipe) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteRecipe(recipe.id, token);
      router.push("/my-recipes");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Recipe could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-zinc-600">Loading recipe...</main>;
  }

  if (!recipe) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-red-700">{error || "Recipe not found."}</main>;
  }

  const isOwner = user?.id === recipe.userId;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 lg:px-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal">{recipe.title}</h1>
            {recipe.description ? (
              <p className="mt-3 text-base leading-7 text-zinc-600">{recipe.description}</p>
            ) : null}
          </div>
          {isOwner ? (
            <div className="flex gap-2">
              <Link
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                href={`/my-recipes/${recipe.id}/edit`}
              >
                Edit
              </Link>
              <button
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {recipe.photoUrl ? (
          <div className="mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={recipe.title}
              className="aspect-[16/9] w-full rounded-lg object-cover"
              src={recipe.photoUrl}
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Link
              className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800"
              href={`/?tag=${encodeURIComponent(tag)}`}
              key={tag}
            >
              {tag}
            </Link>
          ))}
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4">
            <dt className="text-sm font-medium text-zinc-500">Cooking time</dt>
            <dd className="mt-1 font-semibold">{recipe.cookingTime} minutes</dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4">
            <dt className="text-sm font-medium text-zinc-500">Servings</dt>
            <dd className="mt-1 font-semibold">{recipe.servings}</dd>
          </div>
        </dl>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Ingredients</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">{recipe.ingredients}</p>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Instructions</h2>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-700">{recipe.instructions}</p>
        </section>
      </div>
    </main>
  );
}
