"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getRecipes } from "@/lib/client-api";
import type { Recipe } from "@/types/recipes";

import { useAuth } from "./AuthProvider";
import { RecipeCard } from "./RecipeCard";

export function MyRecipes() {
  const { loading: authLoading, user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    getRecipes({ page: 1, pageSize: 50 })
      .then((response) => {
        setRecipes(response.data.filter((recipe) => recipe.userId === user.id));
      })
      .catch((caughtError: Error) => setError(caughtError.message))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <main className="mx-auto max-w-6xl px-5 py-10 text-zinc-600">Loading your recipes...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-semibold">Login required</h1>
          <p className="mt-2 text-zinc-600">You need to login before managing recipes.</p>
          <Link className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white" href="/login">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">My Recipes</h1>
          <p className="mt-2 text-zinc-600">Create, edit, and delete recipes owned by you.</p>
        </div>
        <Link className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800" href="/my-recipes/new">
          New Recipe
        </Link>
      </div>
      {error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {recipes.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">You have not created recipes yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}
