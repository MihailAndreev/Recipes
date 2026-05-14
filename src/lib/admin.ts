import { errorResponse } from "./api";
import { getCurrentUser } from "./auth";

export async function requireAdmin(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      user: null,
      response: errorResponse("Unauthorized.", 401),
    };
  }

  if (!user.isAdmin) {
    return {
      user: null,
      response: errorResponse("Admin access required.", 403),
    };
  }

  return {
    user,
    response: null,
  };
}
