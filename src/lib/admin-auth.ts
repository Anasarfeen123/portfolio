import { auth } from "@/auth";
import { ADMIN_GITHUB_LOGIN } from "@/lib/admin";

/**
 * Re-checked independently inside every /api/admin/** route handler. Not
 * redundant with src/proxy.ts — the proxy matcher is a plain string list
 * that's easy to forget to extend when a new admin route is added later, so
 * it's a fast-redirect UX convenience, not the actual security boundary.
 * This is the boundary. Returns the session if it's the one allowed GitHub
 * account, otherwise null.
 */
export async function requireAdminSession() {
  const session = await auth();
  if (session?.user?.login !== ADMIN_GITHUB_LOGIN) return null;
  return session;
}
