import { NextResponse } from "next/server";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJson(request: Request) {
  try {
    const body = await request.json();

    if (!isRecord(body)) {
      return null;
    }

    return body;
  } catch {
    return null;
  }
}

export function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = getString(value);
  return text.length > 0 ? text : null;
}

export function getPositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

export function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const tags = value
    .map((item) => getString(item).toLowerCase())
    .filter(Boolean);

  return tags.length === value.length ? tags : null;
}
