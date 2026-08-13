// Some of the data below (currently: projects) lives in content/*.json,
// git-backed and editable via /admin, same pattern as src/data/blog.ts —
// except unlike blog.ts, this module is imported by client components too
// (ScrollExperience, ProjectsView, etc.), so it can't do an fs.readFileSync
// at module scope: bundlers can't ship node:fs to the browser. A static
// `import ... from "*.json"` sidesteps that — Turbopack/webpack inline JSON
// imports into the bundle at build time same as any other module, safe for
// both server and client. The one behavioral consequence: like every other
// admin-published change, an edit here only shows up after the redeploy
// the commit triggers, not before — same "~30–90s" model as blog posts,
// not a new one. The admin dashboard itself doesn't use this static import
// at all — it reads live from the GitHub API instead (src/lib/github-content.ts).
import projectsData from "../../content/projects.json";

export type ProjectCategory =
  | "AI & Machine Learning"
  | "Full-Stack Platforms"
  | "Systems & Tools"
  | "Games & Simulations"
  | "Data Science";

export const projectCategories: ProjectCategory[] = [
  "AI & Machine Learning",
  "Full-Stack Platforms",
  "Systems & Tools",
  "Games & Simulations",
  "Data Science",
];

export type Project = {
  id: string;
  repoName: string;
  title: string;
  category: ProjectCategory;
  /** Shown in the homepage 3D carousel. Everything (featured or not) appears on /projects. */
  featured?: boolean;
  signal: string;
  problem: string;
  architecture: string[];
  impact: string;
  technologies: string[];
  github: string;
  demo?: string;
  image?: string;
  /** Extra repos/services that belong to the same product (API, admin, mobile client, sibling repos). */
  links?: { label: string; href: string }[];
};

export type LogEntry = {
  year: string;
  label: string;
  detail: string;
  highlight?: string;
};

export type ExperienceEntry = {
  role: string;
  org: string;
  icon: "microsoft" | "linux" | "hackclub";
  time: string;
  notes: string[];
};

export const profile = {
  name: "Anas Arfeen",
  handle: "Anasarfeen123",
  avatar: "/Photo.jpg",
  role: "AI Engineer & Systems Developer",
  statement: "I build things that make their own decisions — RL agents, LLM tools, computer vision — and the occasional full-stack app people actually use.",
  bio: "CS undergrad at VIT Chennai. Most of what's on this site started as \"I wonder if I can make this\" — a rover that teaches itself not to hit shelves, an LLM that plays competitive Pokémon, a student dashboard a few thousand people use instead of the university's actual portal. I spend a lot of time in a terminal, which probably explains the easter egg.",
  location: "Chennai, Tamil Nadu, India",
  email: "codecrusader07@gmail.com",
  github: "https://github.com/Anasarfeen123",
  linkedin: "https://linkedin.com/in/anas-arfeen",
  portfolio: "https://anasarfeen.dev",
  resume: "/Resume.pdf",
  education: "B.Tech Computer Science & Engineering, VIT Chennai (2025 – 2029)",
  highlights: [
    { label: "AI/ML Co-Lead", value: "Microsoft Innovations Club" },
    { label: "Focus Areas", value: "RL, Vision & Systems" },
    { label: "Location", value: "VIT Chennai, India" },
    { label: "Open Source", value: "GitHub @Anasarfeen123" },
  ],
};

export const journey: LogEntry[] = [
  {
    year: "2022 – 2024",
    label: "Foundations & Systems Curiosity",
    detail: "Built the core engineering layer: deep dive into C++, Python, object-oriented programming, data structures, algorithms, and Linux environment mastery.",
    highlight: "Linux & Algorithms Focus",
  },
  {
    year: "2025",
    label: "VIT Chennai & Builder Ecosystems",
    detail: "Entered B.Tech CSE at VIT Chennai. Immersion in technical clubs: Microsoft Innovations Club, Linux User Group, and Hack Club.",
    highlight: "Community & Peer Code",
  },
  {
    year: "2025 – 2026",
    label: "AI Agents & Computer Vision",
    detail: "Shifted into artificial intelligence: PyTorch, reinforcement learning, ResNet50 vision models, terminal media tools, and open-source GitHub releases.",
    highlight: "Deep Learning & Vision",
  },
  {
    year: "2026 – Present",
    label: "AI/ML Co-Lead & Technical Mentorship",
    detail: "Appointed AI/ML Co-Lead at Microsoft Innovations Club. Spearheading student AI workshops, hands-on hackathons, and production-ready system builds.",
    highlight: "Leadership & Community",
  },
];

export const skillClusters = [
  {
    label: "AI, LLM Agents & Vision",
    description: "Reinforcement learning, LLM-driven agents, RAG & facial similarity",
    modules: ["PyTorch", "Stable-Baselines3", "PPO", "ResNet50", "OpenCV", "Gemini / Ollama", "RAG"],
  },
  {
    label: "Full-Stack Platforms",
    description: "Multi-service products with real backends and real users",
    modules: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Go", "Kotlin Multiplatform"],
  },
  {
    label: "Systems & Terminal UIs",
    description: "Terminal-first tools, media engines & cellular automata",
    modules: ["Python", "Curses", "Pygame", "C++", "Arch Linux", "Hyprland"],
  },
  {
    label: "Environment & Tooling",
    description: "Developer power workflow automation",
    modules: ["Linux CLI", "Git & GitHub", "Jupyter", "Neovim", "GNU GPL v3"],
  },
];

export const projects: Project[] = projectsData as Project[];

export const experience: ExperienceEntry[] = [
  {
    role: "AI/ML Co-Lead",
    org: "Microsoft Innovations Club, VIT Chennai",
    icon: "microsoft",
    time: "2026 – Present",
    notes: [
      "Directs AI/ML technical projects, hands-on workshops, and developer bootcamps for student engineers.",
      "Mentors peers in machine learning workflows, PyTorch model training, and project development.",
      "Automates technical event operations and streamlines collaborative coding initiatives.",
    ],
  },
  {
    role: "AI/ML Member",
    org: "Microsoft Innovations Club, VIT Chennai",
    icon: "microsoft",
    time: "2025 – 2026",
    notes: [
      "Contributed to collaborative machine learning projects and advanced deep learning study groups.",
    ],
  },
  {
    role: "Technical Member",
    org: "Linux User Group, VIT Chennai",
    icon: "linux",
    time: "2025 – 2026",
    notes: [
      "Advocated open-source software, Linux systems customization, and command-line efficiency tools.",
    ],
  },
  {
    role: "AI/ML Member",
    org: "Hack Club, VIT Chennai",
    icon: "hackclub",
    time: "2025 – Present",
    notes: [
      "Participated in student-led rapid prototyping events, hackathons, and open-source hack nights.",
    ],
  },
];
