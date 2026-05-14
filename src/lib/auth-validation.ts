import { getString } from "./api";

export function normalizeEmail(value: unknown) {
  return getString(value).toLowerCase();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 6;
}

export function validateAuthInput(body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const password = getString(body.password);
  const errors: string[] = [];

  if (!validateEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!validatePassword(password)) {
    errors.push("Password must be at least 6 characters.");
  }

  return {
    email,
    password,
    errors,
  };
}
