import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ScrollText } from "lucide-react";
import { blogPosts } from "@/data/blog";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from building reinforcement-learning robotics, LLM-driven agents, and full-stack platforms — the parts that don't fit in a README.",
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const sorted = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="site-page">
      <SiteHeader active="blog" />

      <div className="site-page-inner">
        <div className="site-hero">
          <div className="kicker">
            <ScrollText size={12} /> Field Notes
          </div>
          <h1 className="site-hero-title">Writing about what actually happened.</h1>
          <p className="site-hero-copy">
            Longer-form notes on the projects above — the design decisions, the dead ends, and the parts that don&apos;t
            fit in a README.
          </p>
        </div>

        <div className="blog-list">
          {sorted.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <div className="blog-card-footer">
                <div className="blog-card-tags">
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <span className="blog-card-cta">
                  Read <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
