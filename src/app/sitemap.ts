import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";

const BASE_URL = "https://anasarfeen.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const postRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
