"use client";

import { useEffect, useState } from "react";

import { getRecipes } from "@/lib/client-api";
import type { Paging, Recipe } from "@/types/recipes";

import { RecipeCard } from "./RecipeCard";

type RecipeBrowserProps = {
  initialSearch?: string;
  initialTag?: string;
};

export function RecipeBrowser({ initialSearch = "", initialTag = "" }: RecipeBrowserProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [paging, setPaging] = useState<Paging | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [tag, setTag] = useState(initialTag);
  const [draftSearch, setDraftSearch] = useState(initialSearch);
  const [draftTag, setDraftTag] = useState(initialTag);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setLoading(true);
      setError("");

      getRecipes({ page, pageSize: 6, search, tag })
        .then((response) => {
          setRecipes(response.data);
          setPaging(response.paging);
        })
        .catch((caughtError: Error) => setError(caughtError.message))
        .finally(() => setLoading(false));
    });
  }, [page, search, tag]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setTag(draftTag.trim().toLowerCase());
    setPage(1);
  }

  function clearFilters() {
    setDraftSearch("");
    setDraftTag("");
    setSearch("");
    setTag("");
    setPage(1);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <p className="font-mono text-sm font-semibold uppercase tracking-normal text-emerald-700">
            Recipe Library
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Browse recipes</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Search the collection, filter by tag, and open any recipe for the full ingredients and
            instructions.
          </p>
        </div>
        <form className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_220px_auto_auto]" onSubmit={applyFilters}>
          <input
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-700"
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search pasta, soup, chicken..."
            value={draftSearch}
          />
          <input
            className="min-h-11 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-emerald-700"
            onChange={(event) => setDraftTag(event.target.value)}
            placeholder="Tag"
            value={draftTag}
          />
          <button className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">
            Search
          </button>
          <button className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100" onClick={clearFilters} type="button">
            Clear
          </button>
        </form>
      </div>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">Loading recipes...</p> : null}

      {!loading && recipes.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">No recipes found.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {paging ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            Page {paging.page} of {Math.max(paging.totalPages, 1)} · {paging.total} recipes
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= paging.totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
