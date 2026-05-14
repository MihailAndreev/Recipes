"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deleteAdminRecipe,
  deleteAdminUser,
  getAdminRecipes,
  getAdminUsers,
  updateAdminRecipe,
  updateAdminUser,
} from "@/lib/client-api";
import type { Recipe, RecipePayload, User } from "@/types/recipes";

import { useAuth } from "./AuthProvider";
import { RecipeForm } from "./RecipeForm";

type AdminTab = "recipes" | "users";

export function AdminPanel() {
  const { loading: authLoading, token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("recipes");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [recipeResponse, userResponse] = await Promise.all([
        getAdminRecipes(token),
        getAdminUsers(token),
      ]);
      setRecipes(recipeResponse.data);
      setUsers(userResponse.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.isAdmin) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    queueMicrotask(() => void loadAdminData());
    // loadAdminData intentionally reads current auth token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.isAdmin]);

  async function handleRecipeUpdate(payload: RecipePayload) {
    if (!editingRecipe) {
      return;
    }

    const response = await updateAdminRecipe(editingRecipe.id, payload, token);
    setRecipes((currentRecipes) =>
      currentRecipes.map((recipe) => (recipe.id === response.data.id ? response.data : recipe)),
    );
    setEditingRecipe(null);
    setMessage("Recipe updated.");
  }

  async function handleRecipeDelete(recipeId: number) {
    setError("");
    await deleteAdminRecipe(recipeId, token);
    setRecipes((currentRecipes) => currentRecipes.filter((recipe) => recipe.id !== recipeId));
    setMessage("Recipe deleted.");
  }

  function beginUserEdit(userToEdit: User) {
    setEditingUserId(userToEdit.id);
    setEditingEmail(userToEdit.email);
  }

  async function saveUser(userToEdit: User) {
    setError("");
    const response = await updateAdminUser(userToEdit.id, { email: editingEmail }, token);
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === response.data.id ? response.data : currentUser,
      ),
    );
    setEditingUserId(null);
    setMessage("User updated.");
  }

  async function toggleAdmin(userToEdit: User) {
    setError("");
    const response = await updateAdminUser(userToEdit.id, { isAdmin: !userToEdit.isAdmin }, token);
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === response.data.id ? response.data : currentUser,
      ),
    );
    setMessage(response.data.isAdmin ? "User promoted to admin." : "Admin access removed.");
  }

  async function handleUserDelete(userId: number) {
    setError("");
    await deleteAdminUser(userId, token);
    setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== userId));
    setMessage("User deleted.");
  }

  if (authLoading || loading) {
    return <main className="mx-auto max-w-6xl px-5 py-10 text-zinc-600">Loading admin panel...</main>;
  }

  if (!user?.isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h1 className="text-3xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-zinc-600">Your account does not have permission to use this panel.</p>
          <Link className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white" href="/">
            Back to recipes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8">
      <div className="mb-6">
        <p className="font-mono text-sm font-semibold uppercase tracking-normal text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Admin Panel</h1>
        <p className="mt-2 text-zinc-600">Manage every recipe and user in the system.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "recipes" ? "bg-zinc-950 text-white" : "border border-zinc-300 bg-white"
          }`}
          onClick={() => setActiveTab("recipes")}
          type="button"
        >
          Manage Recipes
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "users" ? "bg-zinc-950 text-white" : "border border-zinc-300 bg-white"
          }`}
          onClick={() => setActiveTab("users")}
          type="button"
        >
          Manage Users
        </button>
      </div>

      {message ? <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {activeTab === "recipes" ? (
        <section className="space-y-4">
          {editingRecipe ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Edit Recipe</h2>
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold"
                  onClick={() => setEditingRecipe(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
              <RecipeForm
                initialRecipe={editingRecipe}
                onSubmit={handleRecipeUpdate}
                submitLabel="Save recipe"
              />
            </div>
          ) : null}
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Owner ID</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td className="px-4 py-3 font-medium">{recipe.title}</td>
                    <td className="px-4 py-3">{recipe.userId}</td>
                    <td className="px-4 py-3">{recipe.tags.join(", ")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link className="rounded-md border border-zinc-300 px-3 py-2 font-semibold" href={`/recipes/${recipe.id}`}>
                          View
                        </Link>
                        <button className="rounded-md border border-zinc-300 px-3 py-2 font-semibold" onClick={() => setEditingRecipe(recipe)} type="button">
                          Edit
                        </button>
                        <button className="rounded-md bg-red-700 px-3 py-2 font-semibold text-white" onClick={() => void handleRecipeDelete(recipe.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((userRow) => (
                <tr key={userRow.id}>
                  <td className="px-4 py-3">{userRow.id}</td>
                  <td className="px-4 py-3">
                    {editingUserId === userRow.id ? (
                      <input
                        className="min-h-10 w-full rounded-md border border-zinc-300 px-3"
                        onChange={(event) => setEditingEmail(event.target.value)}
                        value={editingEmail}
                      />
                    ) : (
                      userRow.email
                    )}
                  </td>
                  <td className="px-4 py-3">{userRow.isAdmin ? "Admin" : "User"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {editingUserId === userRow.id ? (
                        <button className="rounded-md bg-emerald-700 px-3 py-2 font-semibold text-white" onClick={() => void saveUser(userRow)} type="button">
                          Save
                        </button>
                      ) : (
                        <button className="rounded-md border border-zinc-300 px-3 py-2 font-semibold" onClick={() => beginUserEdit(userRow)} type="button">
                          Edit
                        </button>
                      )}
                      <button className="rounded-md border border-zinc-300 px-3 py-2 font-semibold" onClick={() => void toggleAdmin(userRow)} type="button">
                        {userRow.isAdmin ? "Remove Admin" : "Promote"}
                      </button>
                      <button className="rounded-md bg-red-700 px-3 py-2 font-semibold text-white" onClick={() => void handleUserDelete(userRow.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
