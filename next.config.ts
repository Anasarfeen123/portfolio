import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  // src/data/blog.ts reads content/blog/*.md via a dynamic fs.readdirSync
  // call, not a static import. Vercel's serverless file tracer generally
  // catches that fine, but /blog/rss.xml is a dynamic route (re-runs the
  // module at request time, not just at build), so this is declared
  // explicitly rather than relying on the tracer inferring it correctly.
  outputFileTracingIncludes: {
    "/blog/rss.xml": ["./content/blog/**/*.md"],
  },
};

export default nextConfig;
