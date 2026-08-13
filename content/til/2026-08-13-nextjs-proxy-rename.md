---
date: "2026-08-13"
tags: ["Next.js"]
---
Next.js 16 quietly renamed the `middleware.ts` file convention to `proxy.ts` — same job (runs before a route renders, gates auth, redirects), just a new filename and export name (`export function proxy(...)` instead of `middleware`). Every tutorial still says `middleware.ts` because it predates the rename. Found this the hard way wiring up auth for this site's admin panel — worth checking your Next.js version's own bundled docs instead of trusting a cached mental model.
