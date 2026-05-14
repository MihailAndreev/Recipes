import { count, desc } from "drizzle-orm";

import { db } from "@/db";
import { recipes } from "@/db/schema";
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
  const pageSize = Math.min(getPositiveInteger(searchParams.get("pageSize")) ?? 25, 100);
  const offset = (page - 1) * pageSize;

  const [items, totalRows] = await Promise.all([
    db.select().from(recipes).orderBy(desc(recipes.dateCreated)).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(recipes),
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
