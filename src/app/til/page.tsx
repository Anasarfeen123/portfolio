import type { Metadata } from "next";
import { buildInfo } from "@/data/build-info";
import { tilEntries } from "@/data/til";
import { BlogContent } from "@/components/BlogContent";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "TIL",
  description: "Short, no-title notes — things I ran into and figured out while building this site and everything else.",
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TilPage() {
  return (
    <div className="site-page">
      <SiteHeader active="til" buildInfo={buildInfo} />

      <div className="site-page-inner site-page-inner-narrow">
        <div className="site-hero">
          <div className="kicker">TIL</div>
          <h1 className="site-hero-title">Today I learned.</h1>
          <p className="site-hero-copy">
            Shorter than a blog post, no title required — the small things worth writing down before I forget them.
          </p>
        </div>

        {tilEntries.length === 0 ? (
          <p className="viz-empty" style={{ marginTop: 24 }}>
            Nothing here yet.
          </p>
        ) : (
          <div className="til-list">
            {tilEntries.map((entry) => (
              <article key={entry.slug} id={entry.slug} className="til-entry">
                <div className="til-entry-meta">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                  {entry.tags.length > 0 && (
                    <div className="til-entry-tags">
                      {entry.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <BlogContent content={entry.content} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
