import { execSync } from "node:child_process";

export interface BuildInfo {
  hash: string;
  shortHash: string;
  /** ISO 8601 datetime of the commit itself, not the build — close enough
   * in practice since every push to main triggers a redeploy, but exact
   * rather than approximate if a build ever lags behind the commit. */
  date: string;
}

// Server-only (execSync) — like changelog.ts, this can never be imported
// directly by a client component. HUD/SiteHeader (both client components)
// receive it as a prop from their parent server-component page instead.
function loadBuildInfo(): BuildInfo | null {
  try {
    const hash = execSync("git rev-parse HEAD", { cwd: process.cwd(), encoding: "utf-8" }).trim();
    const date = execSync("git log -1 --format=%aI", { cwd: process.cwd(), encoding: "utf-8" }).trim();
    if (!hash || !date) return null;
    return { hash, shortHash: hash.slice(0, 7), date };
  } catch {
    // Same fail-closed reasoning as changelog.ts: some deploy environments
    // ship a tarball without .git. A missing badge isn't worth a broken build.
    return null;
  }
}

export const buildInfo: BuildInfo | null = loadBuildInfo();
