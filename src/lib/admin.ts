/**
 * The one GitHub account allowed to sign in at /admin. Checked in both
 * src/auth.ts (callbacks.signIn — the primary gate, before a session is ever
 * issued) and every /api/admin/** route handler (defense in depth — the
 * proxy.ts matcher is a plain string list, easy to forget to extend later,
 * so it must never be the only thing standing between an unauthenticated
 * request and a write to the repo).
 */
export const ADMIN_GITHUB_LOGIN = "Anasarfeen123";
