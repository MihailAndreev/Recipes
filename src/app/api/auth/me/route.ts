import { errorResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse("Unauthorized.", 401);
  }

  return Response.json({ user });
}
