import type { Paging, Recipe, RecipePayload, User } from "@/types/recipes";

type ApiError = {
  error?: string;
};

type RecipeListResponse = {
  data: Recipe[];
  paging: Paging;
};

type RecipeResponse = {
  data: Recipe;
};

type AuthResponse = {
  user: User;
  token: string;
};

type MeResponse = {
  user: User;
};

async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const data = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

async function apiFormFetch<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, init);
  const data = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function getAuthHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(token: string | null) {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: getAuthHeaders(token),
  });
}

export function getMe(token: string | null) {
  return apiFetch<MeResponse>("/api/auth/me", {
    headers: getAuthHeaders(token),
  });
}

export function getRecipes(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("pageSize", String(params.pageSize ?? 10));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.tag) {
    searchParams.set("tag", params.tag);
  }

  return apiFetch<RecipeListResponse>(`/api/recipes?${searchParams.toString()}`);
}

export function getRecipe(id: number) {
  return apiFetch<RecipeResponse>(`/api/recipes/${id}`);
}

export function createRecipe(payload: RecipePayload, token: string | null) {
  return apiFetch<RecipeResponse>("/api/recipes", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function updateRecipe(id: number, payload: RecipePayload, token: string | null) {
  return apiFetch<RecipeResponse>(`/api/recipes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function deleteRecipe(id: number, token: string | null) {
  return apiFetch<RecipeResponse>(`/api/recipes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}

export function uploadRecipePhoto(id: number, file: File, token: string | null) {
  const formData = new FormData();
  formData.append("photo", file);

  return apiFormFetch<RecipeResponse & { photoUrl: string }>(`/api/recipes/${id}/photo`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: formData,
  });
}

export function removeRecipePhoto(id: number, token: string | null) {
  return apiFetch<RecipeResponse & { photoUrl: null }>(`/api/recipes/${id}/photo`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}
