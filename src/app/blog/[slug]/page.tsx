import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, getAdjacentPosts, getPostBySlug } from "@/data/blog";
import { projects } from "@/data/portfolio";
import { BlogContent } from "@/components/BlogContent";
import { SiteHeader } from "@/components/SiteHeader";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date },
  };
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(post.slug);
  const relatedProject = post.projectId ? projects.find((p) => p.id === post.projectId) : undefined;

  return (
    <div className="site-page">
      <SiteHeader active="blog" />

      <div className="site-page-inner site-page-inner-narrow">
        <Link href="/blog" className="back-link">
          <ArrowLeft size={13} /> All posts
        </Link>

        <article>
          <header className="post-header">
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </header>

          <BlogContent blocks={post.content} />

          {relatedProject && (
            <div className="post-project-card">
              <div className="post-project-label">Project referenced in this post</div>
              <div className="post-project-row">
                <div>
                  <div className="post-project-title">{relatedProject.title}</div>
                  <p>{relatedProject.signal}</p>
                </div>
                <a href={relatedProject.github} target="_blank" rel="noreferrer" className="post-project-link">
                  <GithubIcon size={14} /> Repo
                </a>
              </div>
            </div>
          )}
        </article>

        <nav className="post-nav">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="post-nav-link post-nav-prev">
              <ArrowLeft size={13} />
              <div>
                <div className="post-nav-label">Previous</div>
                <div className="post-nav-title">{prev.title}</div>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="post-nav-link post-nav-next">
              <div>
                <div className="post-nav-label">Next</div>
                <div className="post-nav-title">{next.title}</div>
              </div>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
