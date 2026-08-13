/**
 * Thin wrapper around GitHub's Contents API, used to read/write blog post
 * files directly from the admin UI. Deliberately plain `fetch` rather than
 * an SDK like Octokit — this is 3 REST calls, and `useGitHubRepo.ts`
 * already established the plain-fetch pattern for talking to GitHub here.
 *
 * Auth: GITHUB_CONTENT_TOKEN, a fine-grained PAT scoped to only this repo
 * with Contents: Read-and-write — intentionally separate from the OAuth
 * login token in src/auth.ts, so "who can sign in" and "what the app can
 * write" are independently revocable credentials.
 */

// Shared with src/lib/github-binary.ts (Git Data API — needed for files too
// large/binary for the simple Contents API PUT below, see that file's header).
export const OWNER = process.env.GITHUB_CONTENT_OWNER ?? "Anasarfeen123";
export const REPO = process.env.GITHUB_CONTENT_REPO ?? "portfolio";
export const BRANCH = process.env.GITHUB_CONTENT_BRANCH ?? "main";
export const API_BASE = "https://api.github.com";
const BLOG_DIR = "content/blog";

export function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) {
    throw new Error("GITHUB_CONTENT_TOKEN is not set — the admin write API is not configured.");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function blogFilePath(slug: string): string {
  return `${BLOG_DIR}/${slug}.md`;
}

type GitHubContentEntry = {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
};

type GitHubFileResponse = GitHubContentEntry & {
  content: string; // base64, only present when fetching a single file
  encoding: string;
};

/** Lists the .md files in `dir` directly from GitHub — not the local build —
 * so the admin dashboard reflects a publish immediately instead of waiting
 * on the redeploy it triggers. Returns [] if the directory doesn't exist yet.
 * Shared by the blog and TIL admin dashboards (see listBlogFiles below and
 * til-validation.ts). */
export async function listMarkdownFiles(dir: string): Promise<{ slug: string; path: string; sha: string }[]> {
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/contents/${dir}?ref=${BRANCH}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed: ${res.status} ${await res.text()}`);

  const entries = (await res.json()) as GitHubContentEntry[];
  return entries
    .filter((e) => e.type === "file" && e.name.endsWith(".md"))
    .map((e) => ({ slug: e.name.replace(/\.md$/, ""), path: e.path, sha: e.sha }));
}

export async function listBlogFiles(): Promise<{ slug: string; path: string; sha: string }[]> {
  return listMarkdownFiles(BLOG_DIR);
}

/** Fetches one file's raw content + sha (sha is required to update/delete it). */
export async function getFile(path: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as GitHubFileResponse;
  return { content: Buffer.from(data.content, "base64").toString("utf-8"), sha: data.sha };
}

/** Just the sha, for files where we don't need (or can't safely read) the
 * content — GitHub omits `content` entirely for files over 1MB, so getFile()
 * above throws on anything binary/large. Use this instead before deleting an
 * uploaded image/PDF with deleteFile(), which only needs the sha anyway. */
export async function getFileSha(path: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as GitHubContentEntry;
  return data.sha;
}

/** Creates the file if `sha` is omitted, otherwise updates the existing one — a
 * single commit to BRANCH either way. */
export async function putFile(path: string, content: string, message: string, sha?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
}

export async function deleteFile(path: string, message: string, sha: string): Promise<void> {
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed: ${res.status} ${await res.text()}`);
}
