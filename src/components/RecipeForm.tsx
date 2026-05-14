"use client";

import { useState } from "react";

import type { Recipe, RecipePayload } from "@/types/recipes";

type RecipeFormProps = {
  initialRecipe?: Recipe;
  onSubmit: (payload: RecipePayload, photoFile: File | null, removePhoto: boolean) => Promise<void>;
  submitLabel: string;
};

const emptyPayload: RecipePayload = {
  title: "",
  description: "",
  ingredients: "",
  instructions: "",
  cookingTime: 30,
  servings: 4,
  tags: [],
};

export function RecipeForm({ initialRecipe, onSubmit, submitLabel }: RecipeFormProps) {
  const [payload, setPayload] = useState<RecipePayload>(
    initialRecipe
      ? {
          title: initialRecipe.title,
          description: initialRecipe.description,
          ingredients: initialRecipe.ingredients,
          instructions: initialRecipe.instructions,
          cookingTime: initialRecipe.cookingTime,
          servings: initialRecipe.servings,
          tags: initialRecipe.tags,
        }
      : emptyPayload,
  );
  const [tagText, setTagText] = useState(initialRecipe?.tags.join(", ") ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialRecipe?.photoUrl ?? "");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField<Key extends keyof RecipePayload>(key: Key, value: RecipePayload[Key]) {
    setPayload((currentPayload) => ({
      ...currentPayload,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const tags = tagText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    try {
      await onSubmit(
        {
          ...payload,
          description: payload.description?.trim() || null,
          tags,
        },
        photoFile,
        removePhoto,
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Recipe could not be saved.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
    setRemovePhoto(Boolean(initialRecipe?.photoUrl));
  }

  return (
    <form className="space-y-5 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-zinc-700">
        Title
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
          onChange={(event) => updateField("title", event.target.value)}
          required
          value={payload.title}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-700">
        Description
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700"
          onChange={(event) => updateField("description", event.target.value)}
          value={payload.description ?? ""}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Cooking time
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
            min={1}
            onChange={(event) => updateField("cookingTime", Number(event.target.value))}
            required
            type="number"
            value={payload.cookingTime}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700">
          Servings
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
            min={1}
            onChange={(event) => updateField("servings", Number(event.target.value))}
            required
            type="number"
            value={payload.servings}
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-zinc-700">
        Tags
        <input
          className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
          onChange={(event) => setTagText(event.target.value)}
          placeholder="pasta, vegetarian, quick"
          required
          value={tagText}
        />
      </label>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <label className="block text-sm font-medium text-zinc-700">
          Cover image
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-2 block w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-800"
            onChange={handlePhotoChange}
            type="file"
          />
        </label>
        {photoPreview ? (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Recipe cover preview"
              className="aspect-[16/9] w-full rounded-md object-cover"
              src={photoPreview}
            />
            <button
              className="mt-3 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-white"
              onClick={handleRemovePhoto}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">No cover image selected.</p>
        )}
      </div>
      <label className="block text-sm font-medium text-zinc-700">
        Ingredients
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700"
          onChange={(event) => updateField("ingredients", event.target.value)}
          required
          value={payload.ingredients}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-700">
        Instructions
        <textarea
          className="mt-2 min-h-40 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700"
          onChange={(event) => updateField("instructions", event.target.value)}
          required
          value={payload.instructions}
        />
      </label>
      {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button
        className="min-h-11 rounded-md bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
