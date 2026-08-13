# Portfolio

<p align="center">
  <strong>Personal portfolio site — a 3D, scroll-driven homepage plus a real projects catalog and blog</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React_Three_Fiber-000000?style=flat-square&logo=three.js&logoColor=white" alt="React Three Fiber">
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black" alt="GSAP">
</p>

---

## Overview

anasarfeen.dev: a scroll-choreographed homepage built on **React Three Fiber** (Three.js) for the 3D scene, native CSS scroll-snap + **GSAP ScrollTrigger** for scroll-linked animation, and **Framer Motion** for UI transitions — plus standalone pages (`/projects`, `/blog`, `/til`, `/changelog`) for the parts that don't fit a single scroll journey. There's also a hidden **interactive terminal** overlay (`Cmd+K`) you can open to explore the site command-line-style, including a couple of playable ASCII arcade games — and pressing `?` anywhere shows a shortcuts overlay.

## Pages

- **`/`** — the scroll-driven homepage: hero, origin timeline, skill map, a 3D revolving carousel of featured projects, leadership/experience log, and a contact form.
- **`/projects`** — the full project catalog (every project, not just the homepage's featured picks), with search and category filtering. Reachable from the homepage's "View All Projects" links and from clicking any skill pill (which deep-links here with a pre-filled search).
- **`/blog`** and **`/blog/[slug]`** — longer-form field notes on specific projects (design decisions, dead ends, what changed), separate from the project case-study modals.
- **`/til`** — short, no-title notes (a sentence or two each) on one page in reverse-chronological order, each individually linkable via `#slug`. A lighter-weight cousin of `/blog` for things too small to be a full post.
- **`/changelog`** — a running log of real commits to this site, generated straight from git history at build time (`src/data/changelog.ts`, `execSync("git log …")`). No separate content to maintain — every well-formed Conventional-Commit-style commit shows up automatically on the next deploy.
- **`/admin`** — a git-backed CMS for blog posts, TIL notes, the projects catalog, experience, profile, and the resume PDF, gated to one GitHub account via "Sign in with GitHub." Not linked from anywhere public and excluded from `robots.txt`. See "Admin" below.

## Features

- Scroll-driven 3D scene (`SceneCanvas`) synced to page scroll via native CSS scroll-snap + GSAP ScrollTrigger, with a `prefers-reduced-motion`-aware fallback (scroll-snap disabled, plain fades instead of the 3D tilt/scale reveal). No JS smooth-scroll library — Lenis was removed after its own docs turned out to explicitly warn it doesn't support CSS scroll-snap, which was the root cause of a janky mobile scroll feel
- `HudMobileMenu` — below 640px, both the homepage HUD and the standalone-page `SiteHeader` collapse their full pill row into a single hamburger button that opens a dropdown panel with every link/action, shared by both headers instead of duplicated
- `Revolving3DCarousel` for browsing featured projects in 3D on the homepage; `ProjectCard` grid + `ProjectDetailsModal` for the full catalog on `/projects`
- `ArchitectureDiagram` — a real WebGL 3D scene inside `ProjectDetailsModal`'s "How It's Built" section: layer panels connected by lines, tech-stack nodes (real brand icons via a small hand-picked `simple-icons` extract, or a text-label fallback for algorithm/technique names with no real logo) orbiting each layer, explode-in entrance, drag-to-orbit. Works for every project immediately from the existing `architecture`/`technologies` fields; an optional `architectureLayers` field (editable in `/admin`) unlocks labeled layers with per-layer tech instead of the auto-derived generic version. Falls back to the original plain-text list — with a "View as text" toggle always available — when WebGL isn't available or the visitor prefers reduced motion, same fail-safe pattern as the homepage's 3D scene
- Shared light/dark theme (`useTheme`, `lib/theme.ts`) that persists across the homepage and standalone pages, with a no-flash inline init script
- `TerminalModal` — an interactive terminal easter egg with real commands (`catalog`/`blog`/`til` to jump to those pages, `stats`/`github` for a live fetch of real GitHub profile stats, `quote` for a random dev quote) and a couple of playable ASCII arcade games
- `ShortcutsOverlay` — press `?` anywhere (outside a text input) for a shortcuts modal, mounted once in the root layout
- `GitHubActivityFeed` + `ContributionGraph` — real, live GitHub data on the homepage (recent public activity, the contribution heatmap). Both are public-facing and fail *silently* (render nothing) if the API is unreachable or unconfigured, unlike the admin-side "fail closed with a message" pattern — a site visitor isn't operating a tool
- `BuildBadge` — a small "commit · deployed Xh ago" line trailing the HUD logo on every page (hidden on mobile), plus a fuller "currently live" version at the top of `/changelog`. Sourced from `src/data/build-info.ts` (`git rev-parse HEAD` at build time, same server-only pattern as `changelog.ts`), threaded down to `ScrollExperience`/`SiteHeader` as a prop since both are client components that can't run `execSync` themselves. The relative-time string is computed client-side after mount against the real current clock, not the build's — otherwise a static page viewed days after a deploy would freeze at whatever "Xh ago" was true at build time
- `ResumeModal` for viewing/downloading the résumé in-page. Printing actually works cleanly: the PDF tab delegates to the embedded viewer's own `contentWindow.print()`, and the Quick Summary tab prints a dedicated `.resume-print-sheet` (portaled to `<body>`) instead of the modal's dark UI chrome
- Contact form backed by `/api/contact` (Resend) — falls back to a clear error + mailto link if `RESEND_API_KEY` isn't set; see `.env.example`
- `sitemap.xml`, `robots.txt`, `icon.svg`, a generated `opengraph-image`, and `/blog/rss.xml` via Next.js metadata/route conventions
- Vercel Web Analytics (`@vercel/analytics`)
- **Admin CMS** (`/admin`) — Auth.js v5, GitHub OAuth, restricted to one account (`ADMIN_GITHUB_LOGIN` in `src/lib/admin.ts`). Full CRUD for blog posts (with inline image uploads and link-preview cards), TIL notes, the projects catalog, and experience, plus profile editing and a resume-PDF replace control. Every write is a real commit to `main` — no database. See "Admin" below.
- **Analytics** (`/admin/analytics`) — queries Vercel's Web Analytics API directly (`src/lib/vercel-analytics.ts`, plain `fetch`) for a daily trend chart, top pages/referrers/countries/devices, and per-post pageviews.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Animation | GSAP (ScrollTrigger), native CSS scroll-snap, Framer Motion |
| Styling | Tailwind CSS v4 + a small hand-written design-token system in `globals.css` |
| Content | Markdown + frontmatter (`gray-matter`, `react-markdown`, `remark-gfm`) under `content/blog/` |
| Email | Resend (`/api/contact`) |
| Auth | Auth.js v5 (`next-auth@beta`), GitHub OAuth, JWT sessions — no database |
| Analytics | Vercel Web Analytics (`@vercel/analytics` collector + `src/lib/vercel-analytics.ts` query API in `/admin/analytics`) |

## Project Structure

```
portfolio/
├── content/blog/*.md          # Blog posts — Markdown + frontmatter, one file per post
├── src/
│   ├── auth.ts                # Auth.js v5 config — GitHub OAuth, owner-only signIn callback
│   ├── proxy.ts                # Route protection for /admin/** and /api/admin/** (not middleware.ts on Next 16)
│   ├── app/
│   │   ├── page.tsx              # Homepage (renders ScrollExperience)
│   │   ├── projects/page.tsx     # /projects
│   │   ├── blog/page.tsx         # /blog index
│   │   ├── blog/[slug]/page.tsx  # /blog/:slug
│   │   ├── admin/login/page.tsx           # /admin/login (public)
│   │   ├── admin/(protected)/             # /admin, /admin/new, /admin/[slug]/edit — session re-checked in layout.tsx
│   │   ├── api/auth/[...nextauth]/route.ts, api/admin/posts/**/route.ts
│   │   ├── sitemap.ts, robots.ts, not-found.tsx
│   │   └── layout.tsx, globals.css
│   ├── components/
│   │   ├── SceneCanvas.tsx           # R3F canvas root (homepage background)
│   │   ├── ScrollExperience.tsx      # Homepage scroll choreography (native scroll-snap + GSAP ScrollTrigger)
│   │   ├── Revolving3DCarousel.tsx   # 3D featured-project carousel (homepage)
│   │   ├── SiteHeader.tsx            # Shared nav for /projects and /blog
│   │   ├── ProjectCard.tsx / ProjectsView.tsx / ProjectDetailsModal.tsx
│   │   ├── ArchitectureDiagram.tsx   # 3D exploded architecture view, dynamically imported into ProjectDetailsModal
│   │   ├── BlogContent.tsx           # Renders Markdown post bodies (react-markdown + remark-gfm)
│   │   ├── admin/PostEditor.tsx      # New/edit post form + Write/Preview toggle
│   │   ├── TerminalModal.tsx         # Terminal easter egg + arcade games
│   │   ├── HudMobileMenu.tsx         # Shared mobile hamburger panel (homepage HUD + SiteHeader)
│   │   └── ResumeModal.tsx           # PDF/summary viewer with a real print path for both
│   ├── data/portfolio.ts        # Profile, skills, experience, projects
│   ├── data/blog.ts             # Reads content/blog/*.md at build time (public pages)
│   ├── data/changelog.ts        # /changelog's data — `git log` at build time, server-only
│   ├── data/build-info.ts       # HEAD commit hash + date at build time, server-only — feeds BuildBadge
│   ├── lib/tech-icons.ts        # Hand-picked simple-icons extract (path + brand hex) for ArchitectureDiagram
│   ├── lib/admin.ts             # ADMIN_GITHUB_LOGIN — the one allowed account
│   ├── lib/admin-auth.ts        # requireAdminSession() — re-checked in every /api/admin/** handler
│   ├── lib/github-content.ts    # Reads/writes content/blog/*.md via GitHub's Contents API
│   ├── hooks/, lib/
```

## Getting Started

```bash
git clone https://github.com/Anasarfeen123/portfolio.git
cd portfolio
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` (from [resend.com](https://resend.com)) to enable the contact form. Without it, the form fails with a clear message pointing at the mailto: fallback instead of silently doing nothing.

## Admin

`/admin` is a git-backed CMS: sign in with GitHub, edit content, hit Save, and it commits straight to `main` (which redeploys automatically, live in ~30–90s). No database anywhere.

**What's editable:**
- **Posts** (`/admin`, `/admin/new`, `/admin/[slug]/edit`) — Markdown with a live preview, inline image uploads, and "Add link preview" cards (server-fetches a URL's OG tags at write time, stores the result as a fenced ` ```linkpreview ` JSON block — no raw HTML, no new rendering dependency).
- **TIL** (`/admin/til`) — a quick-add box right on the list page (no separate "new" page — the whole point is low friction), auto-generated slug (date + random suffix, no title to base it on).
- **Projects** (`/admin/projects/*`) — full CRUD over `content/projects.json`, including a screenshot upload and an optional 3D-diagram layer breakdown (`architectureLayers`) for projects worth the extra curation — leave it blank and the diagram auto-builds itself from the existing Architecture/Technologies fields instead.
- **Experience** (`/admin/experience/*`) — full CRUD over `content/experience.json`.
- **Profile** (`/admin/profile`) — single-object edit form over `content/profile.json`.
- **Resume** (`/admin/resume`) — replaces `public/Resume.pdf` directly.
- **Analytics** (`/admin/analytics`) — read-only, queries Vercel directly (see `.env.example` for the token setup).

**Security model** — no database, no custom password/session code:
- Identity is 100% delegated to GitHub OAuth. `callbacks.signIn` in `src/auth.ts` rejects any account that isn't `ADMIN_GITHUB_LOGIN` (`src/lib/admin.ts`) *before* a session is ever issued — GitHub authenticates anyone, only that one account gets in.
- Write access uses a **separate** fine-grained GitHub PAT (`GITHUB_CONTENT_TOKEN`), scoped to only this repo with Contents: Read-and-write — independent from the OAuth login, so each is separately revocable. Text files (Markdown, JSON) go through GitHub's simple Contents API (`src/lib/github-content.ts`); binaries (images, the resume PDF) go through the lower-level Git Data API instead (`src/lib/github-binary.ts`) since the Contents API has a practical ~1MB reliability ceiling for a single write.
- Every `/api/admin/**` route independently re-checks the session (`requireAdminSession()` in `src/lib/admin-auth.ts`) rather than trusting `src/proxy.ts` alone, since the proxy's route matcher is just a string list that's easy to forget to extend later.

**Setup** (you do this yourself — see the full walkthrough in `.env.example`):
1. Create two GitHub OAuth Apps (one prod, one local-dev — a GitHub OAuth App only supports one callback URL) at [github.com/settings/developers](https://github.com/settings/developers)
2. Generate `AUTH_SECRET`: `npx auth secret`
3. Create a fine-grained PAT scoped to just this repo, `Contents: Read and write` only, at [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
4. Set `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` / `AUTH_SECRET` / `GITHUB_CONTENT_TOKEN` in both `.env.local` (dev OAuth app) and the Vercel dashboard (prod OAuth app)
5. Optional, for `/admin/analytics`: a Vercel personal access token + this project's Project ID (Team ID too, if it's under a Team) — see `.env.example`
6. Optional, for the homepage's contribution graph: `GITHUB_STATS_TOKEN`, a **classic** PAT with only the `read:user` scope (a fine-grained PAT doesn't work for this specific GraphQL field) — see `.env.example`

Until those are set, `/admin` (and, separately, `/admin/analytics`) fails closed with a clear "not configured" error. The contribution graph is the one exception — it's public-facing, so it fails *silently* (just doesn't render) instead.

## License

No license file yet — treat as all-rights-reserved until one is added.
