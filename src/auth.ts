import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { ADMIN_GITHUB_LOGIN } from "@/lib/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    // The actual gate: GitHub will happily authenticate anyone, but only the
    // one allowed account ever gets a session issued. Everyone else is
    // rejected right here, before any cookie is set.
    async signIn({ profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      return login === ADMIN_GITHUB_LOGIN;
    },
    // Auth.js's default JWT/session don't carry the GitHub username — persist
    // it explicitly since every admin authorization check compares against it.
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.login = token.login;
      }
      return session;
    },
    // Defense in depth against open-redirect via a crafted callbackUrl: only
    // ever follow same-origin relative paths or same-origin absolute URLs.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // fall through to baseUrl
      }
      return baseUrl;
    },
    // What src/proxy.ts actually enforces — a false/undefined return here
    // auto-redirects to pages.signIn. /admin/login itself must always return
    // true or this loops forever (it's also under the /admin/:path* matcher).
    //
    // /api/admin/** gets a plain 401 instead of that redirect: a fetch()
    // client following a 307 would land on the login page's HTML and choke
    // trying to parse it as JSON, instead of seeing a clean error. The route
    // handlers re-check with requireAdminSession() regardless, so this is
    // just about returning the right shape of response, not the real gate.
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/admin/login") return true;

      const isAllowed = auth?.user?.login === ADMIN_GITHUB_LOGIN;
      if (isAllowed) return true;

      if (pathname.startsWith("/api/")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return false;
    },
  },
});
