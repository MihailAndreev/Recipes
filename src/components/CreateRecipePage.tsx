"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createRecipe, removeRecipePhoto, uploadRecipePhoto } from "@/lib/client-api";
import type { RecipePayload } from "@/types/recipes";

import { useAuth } from "./AuthProvider";
import { RecipeForm } from "./RecipeForm";

export function CreateRecipePage() {
  const router = useRouter();
  const { loading, token, user } = useAuth();

  async function handleSubmit(payload: RecipePayload, photoFile: File | null, removePhoto: boolean) {
    const response = await createRecipe(payload, token);
    if (photoFile) {
      await uploadRecipePhoto(response.data.id, photoFile, token);
    } else if (removePhoto) {
      await removeRecipePhoto(response.data.id, token);
    }
    router.push(`/recipes/${response.data.id}`);
  }

  if (loading) {
    return <main className="mx-auto max-w-4xl px-5 py-10 text-zinc-600">Checking your session...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-semibold">Login required</h1>
          <p className="mt-2 text-zinc-600">Login before creating a recipe.</p>
          <Link className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white" href="/login">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold">Create Recipe</h1>
        <p className="mt-2 text-zinc-600">Add a recipe to your personal collection.</p>
      </div>
      <RecipeForm onSubmit={handleSubmit} submitLabel="Create recipe" />
    </main>
  );
}
