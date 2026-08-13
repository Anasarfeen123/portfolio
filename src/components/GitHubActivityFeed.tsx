"use client";

import { Activity, FolderPlus, GitCommit, GitPullRequest } from "lucide-react";
import { useGitHubActivity, type ActivityItem } from "@/hooks/useGitHubActivity";
import { profile } from "@/data/portfolio";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function KindIcon({ kind }: { kind: ActivityItem["kind"] }) {
  if (kind === "push") return <GitCommit size={13} className="text-[var(--accent)]" />;
  if (kind === "pr") return <GitPullRequest size={13} className="text-[var(--accent)]" />;
  if (kind === "create") return <FolderPlus size={13} className="text-[var(--accent)]" />;
  return <Activity size={13} className="text-[var(--accent)]" />;
}

/** Public-facing widget — fails silently (renders nothing) rather than
 * showing an error to site visitors if the GitHub API is unreachable or
 * rate-limited, unlike the admin-side "fail closed with a clear message"
 * pattern used everywhere else in this project. This is decorative content
 * on a public page, not a tool someone is trying to operate. */
export function GitHubActivityFeed() {
  const { items, loading } = useGitHubActivity(profile.handle, 6);

  if (loading || items.length === 0) return null;

  return (
    <div className="mt-6 border-t border-[var(--line)] pt-5">
      <div className="kicker">Recently on GitHub</div>
      <div className="mt-2 space-y-2.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 group"
          >
            <span className="mt-0.5 shrink-0">
              <KindIcon kind={item.kind} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                {item.message}
              </span>
              <span className="block text-[10px] font-mono text-[var(--muted)] mt-0.5">
                {item.repo.split("/")[1] ?? item.repo} · {relativeTime(item.date)}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
