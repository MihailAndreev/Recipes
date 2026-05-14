"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "./AuthProvider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { loginUser, registerUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }

      router.push("/my-recipes");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">{isLogin ? "Login" : "Create account"}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {isLogin ? "Use your account to manage your recipes." : "Register to create and manage recipes."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Password
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-zinc-300 px-3 outline-none focus:border-emerald-700"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <button
            className="min-h-11 w-full rounded-md bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="mt-5 text-sm text-zinc-600">
          {isLogin ? "Need an account?" : "Already registered?"}{" "}
          <Link className="font-semibold text-emerald-700" href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </p>
      </div>
    </main>
  );
}
