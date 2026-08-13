"use client";

import { useEffect, useState } from "react";

export type ActivityItem = {
  id: string;
  kind: "push" | "pr" | "create" | "other";
  repo: string;
  message: string;
  url: string;
  date: string;
};

type GitHubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: Record<string, unknown>;
};

let cache: { data: ActivityItem[]; loading: boolean } | null = null;

function summarize(event: GitHubEvent): ActivityItem | null {
  const repoUrl = `https://github.com/${event.repo.name}`;

  if (event.type === "PushEvent") {
    const commits = (event.payload.commits as { message: string }[] | undefined) ?? [];
    const first = commits[0]?.message?.split("\n")[0];
    if (!first) return null;
    return {
      id: event.id,
      kind: "push",
      repo: event.repo.name,
      message: commits.length > 1 ? `${first} (+${commits.length - 1} more)` : first,
      url: repoUrl,
      date: event.created_at,
    };
  }

  if (event.type === "PullRequestEvent") {
    const pr = event.payload.pull_request as { title?: string; html_url?: string } | undefined;
    const action = event.payload.action as string | undefined;
    if (!pr?.title || action !== "opened") return null;
    return { id: event.id, kind: "pr", repo: event.repo.name, message: pr.title, url: pr.html_url ?? repoUrl, date: event.created_at };
  }

  if (event.type === "CreateEvent" && event.payload.ref_type === "repository") {
    return { id: event.id, kind: "create", repo: event.repo.name, message: "created the repository", url: repoUrl, date: event.created_at };
  }

  return null;
}

/** Recent public activity across all repos, not one — a different shape of
 * data than useGitHubRepo.ts's per-repo stats, but the same plain-fetch,
 * module-level-cache, unauthenticated-public-API style. Filters GitHub's
 * public events feed down to pushes/PRs/new-repos (the interesting ones),
 * skipping stars/forks/watch noise. */
export function useGitHubActivity(username: string, limit = 6): { items: ActivityItem[]; loading: boolean } {
  const [state, setState] = useState(() => cache ?? { data: [], loading: true });

  useEffect(() => {
    if (cache) {
      setState(cache);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
        if (!res.ok) throw new Error("fetch failed");
        const events = (await res.json()) as GitHubEvent[];
        const items = events
          .map(summarize)
          .filter((item): item is ActivityItem => item !== null)
          .slice(0, limit);
        const result = { data: items, loading: false };
        cache = result;
        if (isMounted) setState(result);
      } catch {
        const result = { data: [], loading: false };
        cache = result;
        if (isMounted) setState(result);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [username, limit]);

  return { items: state.data, loading: state.loading };
}
