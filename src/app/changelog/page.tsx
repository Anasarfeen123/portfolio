import type { Metadata } from "next";
import { changelog } from "@/data/changelog";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Changelog",
  description: "A running, auto-generated log of real commits to this site — what changed and when, straight from git history.",
};

const TYPE_LABELS: Record<string, string> = {
  feat: "Feature",
  fix: "Fix",
  perf: "Performance",
  style: "Style",
  refactor: "Refactor",
  docs: "Docs",
  chore: "Chore",
  revert: "Revert",
  test: "Test",
  build: "Build",
  ci: "CI",
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <div className="site-page">
      <SiteHeader active="changelog" />

      <div className="site-page-inner site-page-inner-narrow">
        <div className="site-hero">
          <div className="kicker">Changelog</div>
          <h1 className="site-hero-title">What changed, and when.</h1>
          <p className="site-hero-copy">
            Generated straight from this site&apos;s own git history at build time — no separate log to
            keep up to date, no editorializing. Every real commit shows up here automatically.
          </p>
        </div>

        {changelog.length === 0 ? (
          <p className="viz-empty" style={{ marginTop: 24 }}>
            Nothing here yet.
          </p>
        ) : (
          <div className="changelog-list">
            {changelog.map((entry) => (
              <div key={entry.hash} className="changelog-entry">
                <span className={`changelog-entry-type changelog-entry-type-${entry.type}`}>
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </span>
                <div className="changelog-entry-body">
                  <p className="changelog-entry-subject">{entry.subject}</p>
                  <div className="changelog-entry-meta">
                    <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                    <a
                      href={`https://github.com/Anasarfeen123/portfolio/commit/${entry.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {entry.shortHash}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
