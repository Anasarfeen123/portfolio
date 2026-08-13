import type { Metadata } from "next";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import { blogFilePath, getFile } from "@/lib/github-content";
import { PostEditor } from "@/components/admin/PostEditor";

export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = await getFile(blogFilePath(slug));
  if (!file) notFound();

  const { data, content } = matter(file.content);

  return (
    <PostEditor
      mode="edit"
      slug={slug}
      initialPost={{
        title: String(data.title ?? ""),
        excerpt: String(data.excerpt ?? ""),
        date: String(data.date ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        readingTime: String(data.readingTime ?? ""),
        projectId: data.projectId ? String(data.projectId) : "",
        content: content.trim(),
      }}
    />
  );
}
