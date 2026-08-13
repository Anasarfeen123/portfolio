import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

// Auth.js's default Session/JWT shapes don't carry the GitHub username. We
// persist it explicitly in src/auth.ts's jwt/session callbacks (profile.login
// -> token.login -> session.user.login) since it's what every admin-side
// authorization check compares against ADMIN_GITHUB_LOGIN.
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & { login?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    login?: string;
  }
}
