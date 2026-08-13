import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { auth, signOut } from "@/auth";
import { ADMIN_GITHUB_LOGIN } from "@/lib/admin";

// Route-group layout — only wraps /admin, /admin/new, /admin/[slug]/edit, NOT
// /admin/login (a sibling outside this group), so this redirect can never
// loop against the sign-in page. src/proxy.ts already redirects unauthenticated
// browser requests before they get here; this is the second, independent check.
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.login !== ADMIN_GITHUB_LOGIN) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="admin-header-mark">
          Admin
        </Link>
        <nav className="admin-header-actions">
          <Link href="/admin/new" className="admin-header-link">
            <Plus size={13} /> New Post
          </Link>
          <Link href="/blog" className="admin-header-link">
            View Blog
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="admin-header-link">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
