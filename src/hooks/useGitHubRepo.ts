"use client";

import { useEffect, useState } from "react";

export type RepoStats = {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string | null;
  loading: boolean;
};

const cache = new Map<string, RepoStats>();

export function useGitHubRepo(repoName?: string): RepoStats {
  const [stats, setStats] = useState<RepoStats>(() => {
    if (repoName && cache.has(repoName)) {
      return cache.get(repoName)!;
    }
    return { stars: 0, forks: 0, language: null, updatedAt: null, loading: true };
  });

  useEffect(() => {
    if (!repoName) {
      setStats((prev) => ({ ...prev, loading: false }));
      return;
    }

    if (cache.has(repoName)) {
      setStats(cache.get(repoName)!);
      return;
    }

    let isMounted = true;
    const fetchRepo = async () => {
      try {
        const fullPath = repoName.includes("/") ? repoName : `Anasarfeen123/${repoName}`;
        const res = await fetch(`https://api.github.com/repos/${fullPath}`);
        if (!res.ok) throw new Error("Repo fetch failed");
        const data = await res.json();

        const newStats: RepoStats = {
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
          language: data.language ?? null,
          updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null,
          loading: false,
        };

        cache.set(repoName, newStats);
        if (isMounted) setStats(newStats);
      } catch {
        if (isMounted) {
          const fallback: RepoStats = { stars: 0, forks: 0, language: null, updatedAt: null, loading: false };
          cache.set(repoName, fallback);
          setStats(fallback);
        }
      }
    };

    fetchRepo();

    return () => {
      isMounted = false;
    };
  }, [repoName]);

  return stats;
}
