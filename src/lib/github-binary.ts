/**
 * Writes/replaces binary files (blog images, the resume PDF) via GitHub's
 * Git Data API — blob -> tree -> commit -> ref. The simple Contents API PUT
 * in github-content.ts (putFile) has a practical ~1MB reliability ceiling
 * for a single base64-in-JSON request (not officially documented, but
 * consistently reported); this is GitHub's own recommended path for larger
 * or binary content, and reuses the exact same GITHUB_CONTENT_TOKEN — its
 * "Contents: Read and write" fine-grained permission already covers the
 * Git Data API surface (blobs/trees/commits/refs), no broader scope needed.
 *
 * Unlike putFile(), the caller never needs to fetch the target path's
 * existing sha first: the tree is keyed by path, so base_tree merges in a
 * create-or-replace at that path either way.
 */

import { API_BASE, authHeaders, BRANCH, OWNER, REPO } from "@/lib/github-content";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — generous for a resume/image, short of bloating repo history

type RefResponse = { object: { sha: string } };
type CommitResponse = { sha: string; tree: { sha: string } };
type BlobResponse = { sha: string };
type TreeResponse = { sha: string };

async function githubJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type PutBinaryFileResult = { commitSha: string };

export async function putBinaryFile(path: string, content: Buffer, message: string): Promise<PutBinaryFileResult> {
  if (content.byteLength > MAX_SIZE_BYTES) {
    throw new Error(`File too large (${(content.byteLength / 1024 / 1024).toFixed(1)}MB, max ${MAX_SIZE_BYTES / 1024 / 1024}MB).`);
  }

  // Steps 1–2 (read the branch tip, then that commit's base tree) can't run
  // fully in parallel — step 2 needs step 1's commit sha — but step 3 (the
  // blob) has no dependency on either, so run it alongside step 1.
  const [ref, blob] = await Promise.all([
    githubJson<RefResponse>(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`),
    githubJson<BlobResponse>(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: "POST",
      // encoding must be explicit — it defaults to utf-8 and silently
      // corrupts binary content otherwise.
      body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
    }),
  ]);
  const latestCommitSha = ref.object.sha;

  const commit = await githubJson<CommitResponse>(`/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`);
  const baseTreeSha = commit.tree.sha;

  // base_tree is mandatory: without it GitHub creates a tree containing ONLY
  // the entries listed here, wiping out every other file in the repo. With
  // it, this is a path-keyed merge — same call shape for both a brand new
  // path and replacing an existing one.
  const tree = await githubJson<TreeResponse>(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [{ path, mode: "100644", type: "blob", sha: blob.sha }],
    }),
  });

  const newCommit = await githubJson<{ sha: string }>(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [latestCommitSha] }),
  });

  // No `force` — fast-forward-only. A 422 here means the branch moved since
  // the read above; surface it and let the caller retry the whole sequence
  // rather than ever forcing (which would silently discard whatever landed
  // in between).
  const res = await fetch(`${API_BASE}/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!res.ok) {
    if (res.status === 422) {
      throw new Error("The branch changed while publishing — try again.");
    }
    throw new Error(`GitHub ref update failed: ${res.status} ${await res.text()}`);
  }

  return { commitSha: newCommit.sha };
}
