const authEndpoints = [
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Create a user, hash the password with bcrypt, and return a JWT.",
    body: `{
  "email": "new-user@example.com",
  "password": "123456"
}`,
  },
  {
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate with email and password. Returns a JWT and sets an auth cookie.",
    body: `{
  "email": "ivan@abv.bg",
  "password": "123456"
}`,
  },
  { method: "POST", path: "/api/auth/logout", description: "Clears the auth cookie." },
  { method: "GET", path: "/api/auth/me", description: "Returns the current authenticated user. Requires a JWT." },
];

const recipeEndpoints = [
  { method: "GET", path: "/api/recipes?page=1&pageSize=10", description: "List recipes with pagination. Maximum pageSize is 50." },
  { method: "GET", path: "/api/recipes?tag=vegetarian", description: "Filter recipes by a tag in the tags array." },
  { method: "GET", path: "/api/recipes?search=soup", description: "Search title, description, ingredients, and instructions." },
  { method: "GET", path: "/api/recipes/1", description: "Get a single recipe by id." },
  {
    method: "POST",
    path: "/api/recipes",
    description: "Create a recipe owned by the authenticated user.",
    protected: true,
    body: `{
  "title": "Tomato Pasta",
  "description": "A quick weeknight pasta.",
  "ingredients": "pasta, tomatoes, garlic, basil, olive oil",
  "instructions": "Boil pasta, simmer sauce, combine, and serve.",
  "cookingTime": 30,
  "servings": 4,
  "tags": ["pasta", "vegetarian"]
}`,
  },
  { method: "PUT", path: "/api/recipes/1", description: "Replace recipe fields. Only the owner can update it.", protected: true },
  { method: "PATCH", path: "/api/recipes/1", description: "Update one or more recipe fields. Only the owner can update it.", protected: true },
  { method: "DELETE", path: "/api/recipes/1", description: "Delete a recipe. Only the owner can delete it.", protected: true },
];

function EndpointCard({
  endpoint,
}: {
  endpoint: {
    method: string;
    path: string;
    description: string;
    body?: string;
    protected?: boolean;
  };
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-zinc-950 px-2 py-1 font-mono text-xs font-semibold text-white">
          {endpoint.method}
        </span>
        {endpoint.protected ? (
          <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
            JWT required
          </span>
        ) : null}
      </div>
      <code className="mt-3 block break-all font-mono text-sm font-semibold text-zinc-950">
        {endpoint.path}
      </code>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{endpoint.description}</p>
      {endpoint.body ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs leading-5 text-zinc-50">
          <code>{endpoint.body}</code>
        </pre>
      ) : null}
    </article>
  );
}

export function ApiDocs() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-10">
          <p className="font-mono text-sm font-semibold uppercase tracking-normal text-emerald-700">
            REST API
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">Recipes API Docs</h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            Authentication uses JWTs. Send the token as an auth cookie from login or as an
            Authorization header: <code className="font-mono text-zinc-950">Bearer token</code>.
          </p>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Response Shape</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Successful recipe responses use <code className="font-mono">data</code>. List
              responses include <code className="font-mono">paging</code>.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Recipe Fields</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Required: title, ingredients, instructions, cookingTime, servings, and tags.
            </p>
          </div>
        </aside>
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Auth Endpoints</h2>
            <div className="grid gap-4">
              {authEndpoints.map((endpoint) => (
                <EndpointCard endpoint={endpoint} key={`${endpoint.method}-${endpoint.path}`} />
              ))}
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Recipe Endpoints</h2>
            <div className="grid gap-4">
              {recipeEndpoints.map((endpoint) => (
                <EndpointCard endpoint={endpoint} key={`${endpoint.method}-${endpoint.path}`} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
