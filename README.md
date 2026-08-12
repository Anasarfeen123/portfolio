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

anasarfeen.dev: a scroll-choreographed homepage built on **React Three Fiber** (Three.js) for the 3D scene, **GSAP** + **Lenis** for smooth-scroll-linked animation, and **Framer Motion** for UI transitions — plus two standalone pages, `/projects` and `/blog`, for the parts that don't fit a single scroll journey. There's also a hidden **interactive terminal** overlay (`Cmd+K`) you can open to explore the site command-line-style, including a couple of playable ASCII arcade games.

## Pages

- **`/`** — the scroll-driven homepage: hero, origin timeline, skill map, a 3D revolving carousel of featured projects, leadership/experience log, and a contact form.
- **`/projects`** — the full project catalog (every project, not just the homepage's featured picks), with search and category filtering. Reachable from the homepage's "View All Projects" links and from clicking any skill pill (which deep-links here with a pre-filled search).
- **`/blog`** and **`/blog/[slug]`** — longer-form field notes on specific projects (design decisions, dead ends, what changed), separate from the project case-study modals.

## Features

- Scroll-driven 3D scene (`SceneCanvas`) synced to page scroll via Lenis + GSAP
- `Revolving3DCarousel` for browsing featured projects in 3D on the homepage; `ProjectCard` grid + `ProjectDetailsModal` for the full catalog on `/projects`
- Shared light/dark theme (`useTheme`, `lib/theme.ts`) that persists across the homepage and standalone pages, with a no-flash inline init script
- `TerminalModal` — an interactive terminal easter egg with real commands (including `catalog`/`blog` to jump to those pages) and a couple of playable ASCII arcade games
- `ResumeModal` for viewing/downloading the résumé in-page
- `sitemap.xml` / `robots.txt` via Next.js metadata routes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| 3D | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Animation | GSAP, Lenis (smooth scroll), Framer Motion |
| Styling | Tailwind CSS v4 + a small hand-written design-token system in `globals.css` |

## Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (renders ScrollExperience)
│   │   ├── projects/page.tsx     # /projects
│   │   ├── blog/page.tsx         # /blog index
│   │   ├── blog/[slug]/page.tsx  # /blog/:slug
│   │   ├── sitemap.ts, robots.ts, not-found.tsx
│   │   └── layout.tsx, globals.css
│   ├── components/
│   │   ├── SceneCanvas.tsx           # R3F canvas root (homepage background)
│   │   ├── ScrollExperience.tsx      # Homepage scroll choreography (Lenis + GSAP)
│   │   ├── Revolving3DCarousel.tsx   # 3D featured-project carousel (homepage)
│   │   ├── SiteHeader.tsx            # Shared nav for /projects and /blog
│   │   ├── ProjectCard.tsx / ProjectsView.tsx / ProjectDetailsModal.tsx
│   │   ├── BlogContent.tsx           # Renders structured blog post blocks
│   │   ├── TerminalModal.tsx         # Terminal easter egg + arcade games
│   │   └── ResumeModal.tsx
│   ├── data/portfolio.ts   # Profile, skills, experience, projects
│   ├── data/blog.ts        # Blog posts (structured content blocks)
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

## License

No license file yet — treat as all-rights-reserved until one is added.
