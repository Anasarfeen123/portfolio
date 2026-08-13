// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (confirmed against node_modules/next/dist/docs/.../proxy.md for the exact
// version installed here). This is only a fast redirect for browser UX —
// every /api/admin/** route handler independently re-checks the session,
// since this matcher is a plain string list that's easy to forget to extend.
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
