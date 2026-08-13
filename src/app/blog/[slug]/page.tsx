import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, getAdjacentPosts, getPostBySlug } from "@/data/blog";
import { buildInfo } from "@/data/build-info";
import { projects } from "@/data/portfolio";
import { BlogContent } from "@/components/BlogContent";
import { GithubIcon } from "@/components/GithubIcon";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { SiteHeader } from "@/components/SiteHeader";

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
      <ReadingProgressBar />
      <SiteHeader active="blog" buildInfo={buildInfo} />

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

          <BlogContent content={post.content} />

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
