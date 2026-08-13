import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type TilEntry = {
  /** Auto-generated at creation (date + a short random suffix) — there's no
   * title to slugify, unlike blog posts. */
  slug: string;
  date: string;
  tags: string[];
  /** Raw Markdown body — a few sentences, no title/excerpt fields at all. */
  content: string;
};

// Same fs-at-module-scope pattern as blog.ts (not portfolio.ts's static
// JSON import) — til.ts is server-only, no client component imports it.
const TIL_DIR = path.join(process.cwd(), "content", "til");

function loadEntries(): TilEntry[] {
  if (!fs.existsSync(TIL_DIR)) return [];

  return fs
    .readdirSync(TIL_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(TIL_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.md$/, ""),
        date: String(data.date ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        content: content.trim(),
      } satisfies TilEntry;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? 1 : -1));
}

export const tilEntries: TilEntry[] = loadEntries();
