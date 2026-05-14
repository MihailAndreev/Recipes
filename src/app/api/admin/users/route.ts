import { asc, count } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getPositiveInteger } from "@/lib/api";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireAdmin(request);

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const page = getPositiveInteger(searchParams.get("page")) ?? 1;
  const pageSize = Math.min(getPositiveInteger(searchParams.get("pageSize")) ?? 50, 100);
  const offset = (page - 1) * pageSize;

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .orderBy(asc(users.email))
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(users),
  ]);
  const total = totalRows[0]?.value ?? 0;

  return Response.json({
    data: items,
    paging: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
