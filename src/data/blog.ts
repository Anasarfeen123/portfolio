import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. 2026-07-25 */
  date: string;
  tags: string[];
  readingTime: string;
  /** Optional id into projects[] this post is about — renders a linked project card. */
  projectId?: string;
  /** Raw Markdown body (frontmatter already stripped). */
  content: string;
};

// Posts live as Markdown+frontmatter files in content/blog/, written/edited
// either directly or via the /admin UI (src/lib/github-content.ts commits
// here through GitHub's API). Read once at module scope — for the public
// blog pages that's build time (SSG via generateStaticParams), so there's no
// runtime filesystem dependency in the deployed app. The /admin dashboard
// deliberately does NOT use this loader — it reads live from the GitHub API
// instead, see src/lib/github-content.ts for why.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function loadPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");

      return {
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        readingTime: String(data.readingTime ?? ""),
        projectId: data.projectId ? String(data.projectId) : undefined,
        content: content.trim(),
      } satisfies BlogPost;
    });
}

export const blogPosts: BlogPost[] = loadPosts();

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAdjacentPosts(slug: string): { prev?: BlogPost; next?: BlogPost } {
  const sorted = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const idx = sorted.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return { prev: sorted[idx + 1], next: sorted[idx - 1] };
}
