import type { Metadata } from "next";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import { getFile } from "@/lib/github-content";
import { tilFilePath } from "@/lib/til-validation";
import { TilEditor } from "@/components/admin/TilEditor";

export const metadata: Metadata = { title: "Edit TIL entry", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditTilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = await getFile(tilFilePath(slug));
  if (!file) notFound();

  const { data, content } = matter(file.content);

  return (
    <TilEditor
      slug={slug}
      initialContent={content.trim()}
      initialDate={String(data.date ?? "")}
      initialTags={Array.isArray(data.tags) ? data.tags.join(", ") : ""}
    />
  );
}
