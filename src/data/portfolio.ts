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
  statement: "Designing intelligent agents, LLM-driven systems, computer vision pipelines, and full-stack platforms used by real students.",
  bio: "Computer Science undergraduate at VIT Chennai passionate about autonomous agents, reinforcement learning, LLM integration, computer vision, terminal tooling, and full-stack systems — from a multi-service student platform used by real students to reinforcement-learning robotics.",
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

export const projects: Project[] = [
  {
    id: "rover",
    repoName: "Vision-based-Rover/Autonomous-Rover",
    title: "Autonomous Warehouse Rover",
    category: "AI & Machine Learning",
    featured: true,
    signal: "PPO reinforcement-learning agent that learns to navigate a warehouse from scratch.",
    problem: "Warehouse navigation changes faster than static paths can adapt, especially with dynamic obstacles and complex layouts.",
    architecture: [
      "Custom Gymnasium environment simulating a differential-drive rover with 15-ray lidar observations",
      "PPO training pipeline (Stable-Baselines3 + PyTorch) with frame stacking and 8 parallel envs",
      "Curriculum learning across 4 warehouse-density levels, promoted at 80% rolling success rate",
    ],
    impact: "Transformed static pathing into an adaptive neural agent that learns navigation strategies autonomously, from open floors to narrow shelf gaps.",
    technologies: ["Python", "PyTorch", "Gymnasium", "Stable-Baselines3", "PPO", "Curriculum Learning"],
    github: "https://github.com/Vision-based-Rover/Autonomous-Rover",
    image: "/projects/rover.png",
    links: [{ label: "Showcase Site", href: "https://github.com/Vision-based-Rover/Autonomous-Rover-Website" }],
  },
  {
    id: "amazecc",
    repoName: "AmazeContinuityProjects/AmazeCC",
    title: "AmazeCC – Student Portal Dashboard",
    category: "Full-Stack Platforms",
    featured: true,
    signal: "Your Entire VIT Life. One Dashboard. Real students use this instead of VTOP.",
    problem: "VIT students have to open half a dozen fragmented university portals to track attendance, marks, hostel, library, and payments.",
    architecture: [
      "Next.js 16 + TypeScript frontend backed by a ~130-route FastAPI/Next API layer over PostgreSQL",
      "One dashboard unifying attendance, grades, timetable, hostel, library, payments, and events",
      "Installable PWA with offline support, push notifications, and a separate ops-only admin dashboard",
    ],
    impact: "A core contributor on a small team (AmazeContinuityProjects) building a real, actively-used product — not a class project. Live at amazecc.com.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "PWA"],
    github: "https://github.com/AmazeContinuityProjects/AmazeCC",
    demo: "https://amazecc.com",
    image: "/projects/amazecc.png",
    links: [
      { label: "API", href: "https://github.com/AmazeContinuityProjects/amazecc-api" },
      { label: "Admin Dashboard", href: "https://github.com/AmazeContinuityProjects/AmazeCC-Dashboard" },
    ],
  },
  {
    id: "amazecc_mobile",
    repoName: "AmazeContinuityProjects/Amazecc-kotlin",
    title: "AmazeCC Mobile",
    category: "Full-Stack Platforms",
    signal: "The AmazeCC ecosystem's native Android/iOS client — one codebase, two platforms.",
    problem: "A PWA can only go so far — students wanted a real installable app with native performance and platform integration.",
    architecture: [
      "Kotlin Multiplatform + Compose Multiplatform — shared UI and networking layer across Android and iOS",
      "Ktor client (OkHttp on Android, Darwin on iOS) talking to the same AmazeCC API backend",
      "Thin platform shells (androidApp / iosApp) bootstrapping the shared Compose UI",
    ],
    impact: "Extended the AmazeCC ecosystem from web to native mobile without duplicating business logic per platform.",
    technologies: ["Kotlin", "Compose Multiplatform", "Ktor"],
    github: "https://github.com/AmazeContinuityProjects/Amazecc-kotlin",
  },
  {
    id: "amazecc_tui",
    repoName: "AmazeContinuityProjects/AmazeCC-CLI",
    title: "AmazeCC TUI",
    category: "Systems & Tools",
    signal: "The AmazeCC ecosystem, again — this time as a terminal app in Go.",
    problem: "Students who live in a terminal shouldn't need a browser tab open just to check today's attendance percentage.",
    architecture: [
      "Full-screen terminal UI built with Bubble Tea + Lip Gloss, with sidebar navigation across academic sections",
      "Configurable API root talking to the AmazeCC FastAPI backend, with a startup + manual API health check",
      "Shared component/style layer so dashboard, courses, grades, progress, and profile screens stay consistent",
    ],
    impact: "A third client on top of the same AmazeCC backend — proof the API layer is genuinely reusable across web, mobile, and terminal.",
    technologies: ["Go", "Bubble Tea", "Lip Gloss"],
    github: "https://github.com/AmazeContinuityProjects/AmazeCC-CLI",
  },
  {
    id: "relay",
    repoName: "ivan-george710/SPONSOR-HELP",
    title: "Relay – Club Sponsorship CRM",
    category: "Full-Stack Platforms",
    featured: true,
    signal: "Multi-tenant CRM that gets college clubs off spreadsheets for sponsor outreach.",
    problem: "Club committees track sponsor outreach in scattered spreadsheets, with no shared pipeline, ownership, or email history.",
    architecture: [
      "Multi-tenant Supabase (Postgres + RLS) backend — clubs are tenants, sponsors are a shared global directory",
      "Kanban-style outreach pipeline per event, with per-sponsor ownership and stage tracking",
      "Gmail OAuth integration to send and sync outreach threads from inside the app, plus a separate internal admin panel",
    ],
    impact: "A 2-person build with a teammate — majority of the architecture, schema design, and features are mine.",
    technologies: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Gmail API"],
    github: "https://github.com/ivan-george710/SPONSOR-HELP",
  },
  {
    id: "collego",
    repoName: "Anasarfeen123/collego",
    title: "Collego – Post-Exam Decision Platform",
    category: "Full-Stack Platforms",
    signal: "A premium admissions planner and college predictor for the chaos right after entrance exams.",
    problem: "After an entrance exam, students juggle cutoff data, college shortlisting, and admissions logistics across a dozen scattered forums with no single trustworthy source.",
    architecture: [
      "\"Playful Geometry\" editorial design system: magazine-cover hero, physics-based custom cursor, spring-animated shapes",
      "JEE-Advanced rank college predictor demo running against a structured cutoff-rank dataset",
      "Zero-chrome floating navigation with per-module accent colors, built vanilla (no framework) and bundled with Vite",
    ],
    impact: "A fully designed, from-scratch product landing page and interaction system — validating the concept UI before the backend/data layer is built out.",
    technologies: ["JavaScript", "Vite", "CSS Animation", "Product Design"],
    github: "https://github.com/ANASARFEEN123/collego",
  },
  {
    id: "spell_masters",
    repoName: "kumar-shaurya/MIC-Spell-Masters",
    title: "Spell Masters – Gesture-Controlled Game",
    category: "AI & Machine Learning",
    signal: "Cast spells with your bare hands — a 72-dimensional gesture recognizer at 60FPS.",
    problem: "Most hobbyist gesture-recognition demos are laggy, low-accuracy, and freeze the game loop while detecting.",
    architecture: [
      "72-dimensional fingertip/wrist vector embeddings matched via cosine similarity for tilt-resistant gesture detection",
      "OpenCV + MediaPipe CV pipeline running fully asynchronously on a background thread",
      "Thread-safe queue hands off gesture events to the Pygame render loop, keeping it locked at 60FPS",
    ],
    impact: "Led development for VIT Chennai's Microsoft Innovations Club Expo 2026, working with the AI/ML department team.",
    technologies: ["Python", "Pygame", "OpenCV", "MediaPipe", "Computer Vision"],
    github: "https://github.com/kumar-shaurya/MIC-Spell-Masters",
  },
  {
    id: "poke_ai",
    repoName: "micvitc/Club-Expo-AIvsChampions",
    title: "poke-ai – LLM Pokémon Battle AI",
    category: "AI & Machine Learning",
    featured: true,
    signal: "An LLM that actually plays competitive Pokémon — not just chats about it.",
    problem: "Competitive Pokémon battling requires fast tactical scoring and deeper strategic reasoning at the same time — pure heuristics miss the latter, pure LLMs are too slow for the former.",
    architecture: [
      "Hybrid decision loop: a heuristic move scorer narrows options fast, then an LLM (Gemini / Ollama / Puter) reasons over the shortlist",
      "Runs against a real, self-hosted Pokémon Showdown server (Node.js) with a custom battle-themed web client",
      "Swappable LLM backends selectable live from the UI, plus a Dockerized deploy path",
    ],
    impact: "Built for Microsoft Innovations Club's Club Expo — a working demonstration of LLMs making real-time tactical decisions, not just text generation.",
    technologies: ["Python", "Node.js", "LLM Integration", "Docker"],
    github: "https://github.com/micvitc/Club-Expo-AIvsChampions",
  },
  {
    id: "reverse_akinator",
    repoName: "reverse-akinator",
    title: "Reverse Akinator",
    category: "AI & Machine Learning",
    signal: "The AI asks the questions — it guesses the footballer you're thinking of in 20.",
    problem: "Flip the classic Akinator formula: instead of a static decision tree, have an LLM dynamically choose the most informative yes/no question at each step.",
    architecture: [
      "Offline RAG knowledge base of 35+ footballer profiles grounds the LLM's questions and guesses in fact",
      "Pluggable LLM layer supporting 6 providers (Ollama, Gemini, OpenAI, Claude, Groq, Puter.js)",
      "Strict state machine (INTRO → PLAYING → VAR_CHECK → WIN/GIVE_UP) on a Vite/React frontend + Express backend",
    ],
    impact: "A self-contained demo of retrieval-grounded LLM reasoning wrapped in a genuinely fun, polished UI.",
    technologies: ["React", "Vite", "Express", "RAG", "LLM Integration"],
    github: "https://github.com/Anasarfeen123/reverse-akinator",
  },
  {
    id: "celeb",
    repoName: "Anasarfeen123/Celeb_Classifier",
    title: "Celeb Classifier AI",
    category: "AI & Machine Learning",
    signal: "ResNet50 deep learning model for celebrity facial lookalike matching.",
    problem: "Facial similarity analysis requires robust deep feature extraction that stays invariant to pose and lighting.",
    architecture: [
      "ResNet50 deep convolutional network feature extractor",
      "Cosine distance similarity matching matrix across celebrity facial embeddings",
      "Deployed on Streamlit Cloud with interactive image upload",
    ],
    impact: "Delivered an interactive computer vision application for real-time facial feature comparisons.",
    technologies: ["Python", "TensorFlow", "ResNet50", "Streamlit"],
    github: "https://github.com/Anasarfeen123/Celeb_Classifier",
    demo: "https://celebritylookalike.streamlit.app/",
  },
  {
    id: "clanofcode",
    repoName: "Anasarfeen123/ClanofCode",
    title: "Symptom Checker AI",
    category: "AI & Machine Learning",
    signal: "Interactive AI health diagnostic web app with a visual body map.",
    problem: "Understanding potential health conditions from complex symptom combinations is difficult for users.",
    architecture: [
      "Interactive visual body map and symptom selector interface",
      "Machine learning diagnostic classification model with confidence scoring",
      "Deployed on Vercel with a responsive mobile diagnostic UI",
    ],
    impact: "Engineered a visual medical triage interface matching symptoms to potential conditions with confidence metrics.",
    technologies: ["JavaScript", "HTML5", "Machine Learning", "Vercel"],
    github: "https://github.com/Anasarfeen123/ClanofCode",
    demo: "https://symptom-checker-five.vercel.app",
  },
  {
    id: "ai_hub",
    repoName: "Anasarfeen123/AI_Hub",
    title: "MIC AI/ML Resource Hub",
    category: "Systems & Tools",
    signal: "A community-maintained roadmap from AI foundations to research, for VIT Chennai's AI/ML track.",
    problem: "New AI/ML club members had no single trustworthy learning path — just scattered links, so onboarding quality varied wildly.",
    architecture: [
      "MkDocs + Material theme static site, auto-published to GitHub Pages on every merge to main",
      "Structured curriculum: foundations → ML → deep learning → CV / NLP / GenAI → reinforcement learning → research",
      "A curated resource library (courses, papers, tools, competitions) plus a project-ideas section, versioned in Git",
    ],
    impact: "The default first link handed to new Microsoft Innovations Club AI/ML members — turns ad-hoc mentoring into a maintained, linkable curriculum.",
    technologies: ["MkDocs", "Material for MkDocs", "Markdown", "GitHub Pages"],
    github: "https://github.com/Anasarfeen123/AI_Hub",
    demo: "https://anasarfeen123.github.io/AI_Hub/",
  },
  {
    id: "wikirace",
    repoName: "Anasarfeen123/Wikirace",
    title: "WikiRace",
    category: "Games & Simulations",
    signal: "Race from one Wikipedia article to another — built to be played by humans or bots.",
    problem: "Most link-navigation games only support human play; there's no way to benchmark an automated agent against the same challenge.",
    architecture: [
      "Shared game core (game_core.py) driving a browser UI, a terminal interface, and a JSON-line bot protocol",
      "Live Wikipedia data via the Wikimedia API, with in-article link rewriting for valid game moves",
      "Click counter, timer, path tracking, and win/give-up detection shared across all three interfaces",
    ],
    impact: "Designed the bot protocol specifically so AI agents can compete on the exact same rules as human players.",
    technologies: ["Python", "Flask", "Wikimedia API"],
    github: "https://github.com/Anasarfeen123/Wikirace",
    links: [{ label: "Vercel deploy variant", href: "https://github.com/Anasarfeen123/wikirace-web" }],
  },
  {
    id: "ascii_cam",
    repoName: "Anasarfeen123/ascii_cam",
    title: "ASCII Cam",
    category: "Systems & Tools",
    signal: "Real-time webcam to ASCII art converter for terminal and web emulators.",
    problem: "Visual media feeds require heavy GUI windows that break keyboard-driven terminal workflows.",
    architecture: [
      "Real-time OpenCV video stream capture pipeline",
      "Dynamic luminance-to-ASCII character mapping matrix",
      "Supports black & white contrast gradients and full terminal color modes",
    ],
    impact: "Created a lightweight real-time camera processing utility operating directly inside terminal emulators.",
    technologies: ["Python", "OpenCV", "Terminal UI", "Luminance Mapping"],
    github: "https://github.com/Anasarfeen123/ascii_cam",
    demo: "https://anasarfeen123.github.io/ascii_cam/",
    image: "/projects/ascii_cam.png",
  },
  {
    id: "musicalterm",
    repoName: "Anasarfeen123/MusicalTerm",
    title: "MusicalTerm",
    category: "Systems & Tools",
    signal: "Aesthetic terminal-native music player with live streaming.",
    problem: "Heavy GUI media players introduce distraction and memory overhead during intensive coding sessions.",
    architecture: [
      "Asynchronous Python audio control surface powered by curses",
      "Direct streaming audio pipeline from YouTube and YouTube Music URLs via yt-dlp + mpv",
      "Keyboard-native playback controls with a terminal visualizer spectrum and lyrics view",
    ],
    impact: "Built a keyboard-native audio engine operating entirely within Linux terminal environments.",
    technologies: ["Python", "Curses", "Audio Streaming", "Terminal UI"],
    github: "https://github.com/Anasarfeen123/MusicalTerm",
  },
  {
    id: "signal",
    repoName: "Anasarfeen123/campus-signal-mapper",
    title: "Campus Signal Mapper",
    category: "Full-Stack Platforms",
    signal: "Crowdsourced carrier telemetry & real-time heatmap for VIT Chennai.",
    problem: "Students experience unpredictable mobile coverage across campus buildings without signal visibility, and existing coverage maps aren't crowd-sourced or live.",
    architecture: [
      "Flask + Flask-SocketIO backend broadcasting live signal/speed samples to every connected client",
      "SQLite-backed sample store with geofencing (VIT Chennai bounds only) and rate limiting against spam",
      "Leaflet.js + Leaflet.heat frontend rendering a filterable dual heatmap (signal strength & download speed)",
    ],
    impact: "Converted campus connectivity pain points into a shared, live, inspectable telemetry map for students.",
    technologies: ["Python", "Flask", "Flask-SocketIO", "SQLite", "Leaflet.js"],
    github: "https://github.com/Anasarfeen123/campus-signal-mapper",
    demo: "https://vitc-signal-mapper.onrender.com/",
  },
  {
    id: "smart_solar",
    repoName: "Anasarfeen123/Smart-Solar-Panel",
    title: "Smart Solar Panel Tracker",
    category: "Systems & Tools",
    signal: "Arduino firmware for a servo-driven panel that tracks the sun's angle through the day.",
    problem: "Fixed solar panels lose a meaningful chunk of daily energy yield versus panels that mechanically track the sun's position.",
    architecture: [
      "Servo-driven single-axis tracker mapping real-world sun angles to a 0–180° servo range",
      "DS3231 real-time-clock-based production mode: drives the servo to the correct angle for the actual time of day within a sunrise/sunset window",
      "PlatformIO build targeting an Arduino Uno, with a fast demo-sweep mode for bench testing without waiting on real daylight",
    ],
    impact: "A from-scratch embedded systems build spanning firmware, hardware wiring, and real-time-clock-driven control logic.",
    technologies: ["C++", "Arduino", "PlatformIO", "Servo Control", "RTC (DS3231)"],
    github: "https://github.com/Anasarfeen123/Smart-Solar-Panel",
  },
  {
    id: "vit_recommendor",
    repoName: "Anasarfeen123/vit-counselling-recommendor",
    title: "VIT Counselling Predictor",
    category: "Data Science",
    signal: "Helps incoming students navigate VIT's counselling process with real cutoff data.",
    problem: "VIT's counselling/admission process is opaque — students have no way to gauge their odds against historical allotment cutoffs.",
    architecture: [
      "Streamlit app modeling admission probability from historical allotment rank data",
      "Live form submissions feed back into the dataset for continually improving cutoff estimates",
      "Separate password-protected admin app for records, imports/exports, and data-quality checks",
    ],
    impact: "A genuinely used-by-peers tool — turns anecdotal 'what rank do I need' questions into a real probability estimate.",
    technologies: ["Python", "Streamlit", "Pandas"],
    github: "https://github.com/Anasarfeen123/vit-counselling-recommendor",
  },
  {
    id: "movie_prediction",
    repoName: "Anasarfeen123/Movie_prediction_AI",
    title: "IMDb Sentiment Classifier",
    category: "Data Science",
    signal: "Logistic regression model classifying IMDb reviews as positive or negative.",
    problem: "Raw review text needs to become a usable signal — a clean pipeline from text to sentiment label, done properly end-to-end.",
    architecture: [
      "Pandas-based ingestion of the IMDb review dataset, mapped to binary sentiment labels",
      "scikit-learn CountVectorizer (English stop-words removed) for text vectorization",
      "Logistic regression classifier evaluated via accuracy, confusion matrix, and word-frequency analysis",
    ],
    impact: "A clean, from-scratch NLP pipeline exercise — ingestion, vectorization, classification, and evaluation, not a black-box library call.",
    technologies: ["Python", "Jupyter Notebook", "Pandas", "Scikit-Learn"],
    github: "https://github.com/Anasarfeen123/Movie_prediction_AI",
  },
  {
    id: "breakout",
    repoName: "Anasarfeen123/breakout",
    title: "Breakout – Pygame Revival",
    category: "Games & Simulations",
    signal: "High-octane arcade engine with dynamic physics and multi-track audio.",
    problem: "Classic arcade games lack procedural difficulty scaling and adaptive audio feedback.",
    architecture: [
      "Custom Pygame physics & collision engine",
      "Adaptive multi-track audio manager responding to game velocity",
      "Procedural power-up generation and brick matrix state machine",
    ],
    impact: "Engineered a responsive 2D arcade physics engine showcasing game loop design patterns.",
    technologies: ["Python", "Pygame", "Arcade Physics", "Audio State Machine"],
    github: "https://github.com/Anasarfeen123/breakout",
  },
  {
    id: "convoy_gol",
    repoName: "Anasarfeen123/convoy_gol",
    title: "Cellular Automata Engine (Convoy)",
    category: "Games & Simulations",
    signal: "Pygame visualization engine supporting 8 distinct cellular rule sets.",
    problem: "Standard Game of Life simulators restrict cell behavior to binary state transitions without aging dynamics.",
    architecture: [
      "Multi-rule cellular grid computation engine",
      "Color gradient cell aging and decay state renderer",
      "Supports Conway's Game of Life, HighLife, Seeds, and custom rule sets",
    ],
    impact: "Built a computational laboratory for exploring cellular automata patterns and emergent behavior.",
    technologies: ["Python", "Pygame", "Cellular Automata", "Algorithms"],
    github: "https://github.com/Anasarfeen123/convoy_gol",
  },
  {
    id: "snake_ai",
    repoName: "Anasarfeen123/snake",
    title: "Snake AI",
    category: "Games & Simulations",
    signal: "Classic Snake with a bot that can take over using Greedy or A* pathfinding.",
    problem: "A good pathfinding sandbox needs a simple, visual game loop where search-algorithm behavior is easy to see and compare live.",
    architecture: [
      "Pygame game loop shared between manual arrow-key play and autoplay AI modes",
      "Toggleable Greedy best-first and A* search strategies driving the snake's next move each tick",
      "Dynamic food spawning that avoids the snake body and walls, with adjustable speed control",
    ],
    impact: "A compact, visual way to compare two classic search algorithms making the same real-time decisions.",
    technologies: ["Python", "Pygame", "A* Search", "Greedy Search"],
    github: "https://github.com/Anasarfeen123/snake",
  },
  {
    id: "tetris",
    repoName: "Anasarfeen123/tetris",
    title: "Tetris (From Scratch)",
    category: "Games & Simulations",
    signal: "A from-scratch Tetris clone with SRS rotation, ghost pieces, and lock delay.",
    problem: "Recreating Tetris properly means getting the small mechanics right — rotation systems, lock timing, and hard drops — not just a falling-blocks demo.",
    architecture: [
      "Full SRS-style piece rotation system with the standard 7-piece set",
      "Ghost-piece projection showing landing position, plus lock delay before a piece locks in",
      "Work-in-progress placement-search algorithm for automated piece placement",
    ],
    impact: "A faithful from-scratch implementation of the mechanics that make Tetris feel right, built purely in Python/Pygame.",
    technologies: ["Python", "Pygame", "Game Mechanics"],
    github: "https://github.com/Anasarfeen123/tetris",
  },
  {
    id: "solar_sandbox",
    repoName: "Anasarfeen123/py_solar_sys",
    title: "Solar System Sandbox",
    category: "Games & Simulations",
    signal: "A tiny 'Universe Sandbox' — spawn planets, launch them with velocity, watch them orbit or collide.",
    problem: "Gravity and orbital mechanics are easiest to understand by playing with them directly, not just reading the equations.",
    architecture: [
      "2D N-body gravity simulation built from scratch in Pygame",
      "Click-and-drag spawning where drag direction/length sets a body's initial velocity vector",
      "Collision handling that merges colliding bodies into larger ones, conserving momentum",
    ],
    impact: "A from-scratch physics simulation exercise — real orbital dynamics emerging from a simple gravity loop, not scripted paths.",
    technologies: ["Python", "Pygame", "Physics Simulation", "N-Body Gravity"],
    github: "https://github.com/Anasarfeen123/py_solar_sys",
  },
  {
    id: "dotfiles",
    repoName: "Anasarfeen123/dotfile",
    title: "Hyprland Desktop Rice",
    category: "Systems & Tools",
    signal: "A daily-driven, keyboard-first Wayland desktop — Quickshell, fish, matugen theming.",
    problem: "Default desktop environments consume unnecessary RAM and interrupt keyboard-driven, terminal-first workflows.",
    architecture: [
      "Hyprland (Wayland compositor) + Quickshell for the bar/widgets, built on top of end-4/dots-hyprland as a base",
      "fish shell, kitty/foot terminals, fuzzel launcher, hyprlock with a custom analog-clock renderer",
      "matugen + Kvantum for cohesive, wallpaper-derived theming across every app",
    ],
    impact: "The actual desktop environment used day-to-day — not a one-off screenshot rice, a maintained personal config.",
    technologies: ["Hyprland", "Quickshell", "Wayland", "fish", "Arch Linux"],
    github: "https://github.com/Anasarfeen123/dotfile",
  },
];

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
