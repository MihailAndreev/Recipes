import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ message: "Logged out." });
  response.headers.append("Set-Cookie", clearAuthCookie());

  return response;
}
