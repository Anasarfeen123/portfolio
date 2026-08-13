export const TIL_DIR = "content/til";

export function tilFilePath(slug: string): string {
  return `${TIL_DIR}/${slug}.md`;
}

/** No title to slugify (that's the point of TIL entries), so the slug is
 * generated server-side from the date plus a short random suffix — the
 * admin never types or sees this before creation. */
export function generateTilSlug(date: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${date}-${suffix}`;
}

export function validateTilBody(body: { content?: unknown; date?: unknown; tags?: unknown }): { content: string; date: string; tags: string[] } | { error: string } {
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const date = typeof body.date === "string" && body.date ? body.date : new Date().toISOString().slice(0, 10);
  const tags = Array.isArray(body.tags) ? body.tags.map(String).filter(Boolean) : [];

  if (!content) return { error: "Content is required." };
  if (content.length > 2000) return { error: "Keep it short — under 2000 characters." };

  return { content, date, tags };
}
