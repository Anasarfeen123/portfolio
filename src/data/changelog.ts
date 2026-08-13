import { execSync } from "node:child_process";

export interface ChangelogEntry {
  hash: string;
  shortHash: string;
  date: string; // YYYY-MM-DD
  type: string; // feat, fix, perf, style, refactor, docs, chore, ...
  subject: string; // commit subject, with the "type: " prefix stripped
}

// Conventional-Commit-shaped subjects only ("type: message" or
// "type(scope): message") — this project has followed that convention
// consistently since the rewrite, so the filter naturally excludes only the
// handful of informal commits from before ("fixed", "first commit", etc.)
// without needing a hand-maintained allowlist. New commits show up here
// automatically as long as they keep following the convention.
const CONVENTIONAL_COMMIT = /^(\w+)(\([^)]+\))?:\s*(.+)$/;

// Server-only (execSync, node:child_process) — never import this from a
// client component. Runs once at build time, same as blog.ts/til.ts reading
// content off disk; the changelog is whatever main looked like at build,
// refreshed on every redeploy since every push already triggers one.
function loadChangelog(): ChangelogEntry[] {
  try {
    const raw = execSync('git log --no-merges --date=short --pretty=format:"%H%x1f%ad%x1f%s"', {
      cwd: process.cwd(),
      encoding: "utf-8",
      maxBuffer: 4 * 1024 * 1024,
    });

    return raw
      .split("\n")
      .filter(Boolean)
      .flatMap((line) => {
        const [hash, date, subject] = line.split("\x1f");
        const match = subject?.match(CONVENTIONAL_COMMIT);
        if (!hash || !date || !match) return [];
        const [, type, , message] = match;
        return [
          {
            hash,
            shortHash: hash.slice(0, 7),
            date,
            type: type.toLowerCase(),
            subject: message,
          },
        ];
      });
  } catch {
    // Not a git checkout at build time (some deploy environments ship a
    // tarball without .git) — fail closed with an empty list rather than
    // breaking the build over a nice-to-have page.
    return [];
  }
}

export const changelog: ChangelogEntry[] = loadChangelog();
