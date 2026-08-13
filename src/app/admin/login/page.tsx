import type { Metadata } from "next";
import { signIn } from "@/auth";
import { GithubIcon } from "@/components/GithubIcon";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="kicker">Admin</div>
        <h1 className="admin-auth-title">Sign in to write.</h1>
        <p className="admin-auth-copy">Restricted to one GitHub account. Everyone else gets bounced.</p>

        {error && (
          <p className="admin-auth-error">
            {error === "AccessDenied"
              ? "That GitHub account isn't authorized for this dashboard."
              : "Something went wrong signing in — try again."}
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button type="submit" className="admin-auth-button">
            <GithubIcon size={16} /> Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
