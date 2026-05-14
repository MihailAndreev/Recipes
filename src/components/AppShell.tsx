"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "./AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, logoutUser, user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-normal">
            Recipes
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link className="rounded-md px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100" href="/">
              Browse
            </Link>
            <Link
              className="rounded-md px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
              href="/api-docs"
            >
              API Docs
            </Link>
            {user ? (
              <>
                <Link
                  className="rounded-md px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
                  href="/my-recipes"
                >
                  My Recipes
                </Link>
                <Link
                  className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800"
                  href="/my-recipes/new"
                >
                  New Recipe
                </Link>
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-md px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
        {!loading && user ? (
          <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-2 text-center text-xs text-zinc-600">
            Signed in as {user.email}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
