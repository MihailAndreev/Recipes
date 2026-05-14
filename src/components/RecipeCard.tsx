import Link from "next/link";

import type { Recipe } from "@/types/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        {recipe.photoUrl ? (
          <Link href={`/recipes/${recipe.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={recipe.title}
              className="aspect-[16/9] w-full rounded-md object-cover"
              src={recipe.photoUrl}
            />
          </Link>
        ) : null}
        <div>
          <Link className="text-xl font-semibold hover:text-emerald-700" href={`/recipes/${recipe.id}`}>
            {recipe.title}
          </Link>
          {recipe.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{recipe.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Link
              className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              href={`/?tag=${encodeURIComponent(tag)}`}
              key={tag}
            >
              {tag}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>{recipe.cookingTime} min</span>
          <span>{recipe.servings} servings</span>
        </div>
      </div>
    </article>
  );
}
