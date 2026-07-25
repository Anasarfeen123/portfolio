export type Project = {
  id: string;
  repoName: string;
  title: string;
  signal: string;
  problem: string;
  architecture: string[];
  impact: string;
  technologies: string[];
  github: string;
  demo?: string;
  image?: string;
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
  statement: "Designing intelligent agents, computer vision systems, terminal tools, and machine learning applications.",
  bio: "Computer Science undergraduate at VIT Chennai passionate about autonomous agents, reinforcement learning, computer vision, terminal tooling, and Linux systems programming.",
  location: "Chennai, Tamil Nadu, India",
  email: "anasarfeen123@gmail.com",
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
    label: "AI & Computer Vision",
    description: "Deep learning, vision pathfinding & facial similarity",
    modules: ["PyTorch", "Stable-Baselines3", "PPO", "ResNet50", "OpenCV", "NumPy"],
  },
  {
    label: "Systems & Terminal UIs",
    description: "Terminal-first tools, media engines & cellular automata",
    modules: ["Python", "Curses", "Pygame", "C++", "Arch Linux", "Hyprland"],
  },
  {
    label: "Web & Telemetry Engines",
    description: "Business continuity platforms & crowdsourced heatmaps",
    modules: ["JavaScript", "HTML5 Canvas", "Heatmaps", "CSS3", "Render / Vercel"],
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
    signal: "Reinforcement learning & vision agent for autonomous indoor navigation.",
    problem: "Warehouse navigation changes faster than static paths can adapt, especially with dynamic obstacles and complex layouts.",
    architecture: [
      "Custom MVC simulation and rendering environment built in Python",
      "PPO training pipeline using Stable-Baselines3 and PyTorch",
      "Curriculum learning strategy over progressively complex obstacle maps",
    ],
    impact: "Transformed static pathing into an adaptive neural agent that learns navigation strategies autonomously.",
    technologies: ["Python", "PyTorch", "Stable-Baselines3", "PPO", "Curriculum Learning", "OpenCV"],
    github: "https://github.com/Vision-based-Rover/Autonomous-Rover",
    image: "/projects/rover.png",
  },
  {
    id: "amazecc",
    repoName: "AmazeContinuityProjects/AmazeCC",
    title: "AmazeCC – Student Portal Dashboard",
    signal: "Your Entire VIT Life. One Dashboard. Next-generation student portal wrapper.",
    problem: "VIT students have to open 10 different portals to track attendance, marks, room counselling, and mess menus.",
    architecture: [
      "All-in-one student portal wrapper unifying 30+ tools and 10+ modules",
      "Instant tracking for attendance, marks, room counselling & mess menus",
      "Lightweight, local-first responsive web client for mobile and desktop",
    ],
    impact: "Replaced 10 fragmented university portals with a unified, high-speed dashboard for VIT students.",
    technologies: ["JavaScript", "React", "VITOP Wrapper", "Local-First Architecture"],
    github: "https://github.com/AmazeContinuityProjects/AmazeCC",
    image: "/projects/amazecc.png",
  },
  {
    id: "ascii_cam",
    repoName: "ascii_cam",
    title: "ASCII Cam",
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
    repoName: "MusicalTerm",
    title: "MusicalTerm",
    signal: "Aesthetic terminal-native music player with live streaming.",
    problem: "Heavy GUI media players introduce distraction and memory overhead during intensive coding sessions.",
    architecture: [
      "Asynchronous Python audio control surface powered by curses",
      "Direct streaming audio pipeline from YouTube and YouTube Music URLs",
      "Keyboard-native playback controls with terminal visualizer spectrum",
    ],
    impact: "Built a keyboard-native audio engine operating entirely within Linux terminal environments.",
    technologies: ["Python", "Curses", "Audio Streaming", "Terminal UI"],
    github: "https://github.com/Anasarfeen123/MusicalTerm",
  },
  {
    id: "celeb",
    repoName: "Celeb_Classifier",
    title: "Celeb Classifier AI",
    signal: "ResNet50 deep learning model for celebrity facial lookalike matching.",
    problem: "Facial similarity analysis requires robust deep feature extraction that stays invariant to pose and lighting.",
    architecture: [
      "ResNet50 deep convolutional network feature extractor",
      "Cosine distance similarity matching matrix across celebrity facial embeddings",
      "Deployed on Streamlit Cloud with interactive image upload",
    ],
    impact: "Delivered an interactive computer vision application for real-time facial feature comparisons.",
    technologies: ["Python", "PyTorch", "ResNet50", "OpenCV", "Streamlit"],
    github: "https://github.com/Anasarfeen123/Celeb_Classifier",
    demo: "https://celebritylookalike.streamlit.app/",
  },
  {
    id: "signal",
    repoName: "campus-signal-mapper",
    title: "Campus Signal Mapper",
    signal: "Crowdsourced carrier telemetry & real-time heatmap for VIT Chennai.",
    problem: "Students experience unpredictable mobile coverage across campus buildings without signal visibility.",
    architecture: [
      "Real-time cellular signal telemetry collection engine",
      "Client-side HTML5 Canvas rendering layer",
      "Dynamic interactive campus heatmap visualization for cellular carriers",
    ],
    impact: "Converted campus connectivity pain points into a shared, inspectable telemetry map for students.",
    technologies: ["JavaScript", "HTML5 Canvas", "Heatmaps", "CSS3"],
    github: "https://github.com/Anasarfeen123/campus-signal-mapper",
    demo: "https://vitc-signal-mapper.onrender.com/",
  },
  {
    id: "breakout",
    repoName: "breakout",
    title: "Breakout – Pygame Revival",
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
    id: "clanofcode",
    repoName: "ClanofCode",
    title: "Symptom Checker AI (ClanofCode)",
    signal: "Interactive AI health diagnostic web app with visual body map.",
    problem: "Understanding potential health conditions from complex symptom combinations is difficult for users.",
    architecture: [
      "Interactive visual body map and symptom selector interface",
      "Machine learning diagnostic classification model with confidence scoring",
      "Deployed on Vercel with responsive mobile diagnostic UI",
    ],
    impact: "Engineered a visual medical triage interface matching symptoms to potential conditions with confidence metrics.",
    technologies: ["JavaScript", "HTML5", "Machine Learning", "Vercel"],
    github: "https://github.com/Anasarfeen123/ClanofCode",
    demo: "https://symptom-checker-five.vercel.app",
  },
  {
    id: "convoy_gol",
    repoName: "convoy_gol",
    title: "Cellular Automata Engine (convoy_gol)",
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
    id: "movie_prediction",
    repoName: "Movie_prediction_AI",
    title: "Movie Prediction AI",
    signal: "Machine learning prediction engine for ratings & box office trends.",
    problem: "Film success forecasting requires multi-feature regression across budget, genre, and cast metrics.",
    architecture: [
      "Multi-feature dataset preprocessing and feature engineering pipeline",
      "Supervised regression models trained on historic cinema telemetry",
      "Evaluated via R² and RMSE performance benchmarks in Jupyter",
    ],
    impact: "Constructed an end-to-end predictive machine learning notebook analyzing cinema success factors.",
    technologies: ["Python", "Jupyter Notebook", "Pandas", "Scikit-Learn"],
    github: "https://github.com/Anasarfeen123/Movie_prediction_AI",
  },
  {
    id: "hyprland",
    repoName: "anas-hyprland",
    title: "Hyprland Arch Linux Rice",
    signal: "Usability-first Wayland environment dotfiles and system scripts.",
    problem: "Default desktop managers consume unnecessary RAM and interrupt keyboard-driven window navigation.",
    architecture: [
      "Modular Hyprland wayland compositor configuration",
      "Custom Waybar, Rofi, and Swaync desktop widget integration",
      "Shell automation scripts for hardware telemetry and workspace management",
    ],
    impact: "Built an ultra-fast, minimal Linux desktop environment tailored for developer productivity.",
    technologies: ["Arch Linux", "Hyprland", "Wayland", "Bash"],
    github: "https://github.com/Anasarfeen123/anas-hyprland",
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
