export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'AI/ML' | 'Systems' | 'Web & Tools' | 'Deep Learning';
  tags: string[];
  description: string;
  problem: string;
  solution: string;
  impact: string;
  architecture: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: 'Deployed' | 'Open Source' | 'Active R&D';
  metrics?: { label: string; value: string }[];
}

export interface SkillNode {
  name: string;
  category: 'AI/ML & RL' | 'Languages & Systems' | 'Developer Ecosystem';
  level: number; // 1-100
  iconName: string;
  description: string;
  relatedProjects: string[];
  snippet?: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  location: string;
  period: string;
  current: boolean;
  type: 'Leadership' | 'Technical';
  highlights: string[];
  techUsed: string[];
}

export interface JourneyMilestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  tag: string;
}

export interface Achievement {
  title: string;
  category: string;
  date: string;
  issuer: string;
  description: string;
  badgeText: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  contentSnippet: string;
}

export const PERSONAL_INFO = {
  name: "Anas Arfeen",
  handle: "codecrusader07",
  email: "codecrusader07@gmail.com",
  role: "AI Engineer & Systems Developer",
  tagline: "Building Autonomous Agents, Neural Architectures, & High-Performance Developer Tooling.",
  subtext: "Computer Science Undergraduate at VIT Chennai. AI/ML Co-Lead at Microsoft Innovations Club. Arch Linux & Neovim enthusiast ricing systems for peak engineering velocity.",
  institution: "Vellore Institute of Technology (VIT), Chennai",
  degree: "B.Tech in Computer Science Engineering (2025 – 2029)",
  academics: [
    { level: "B.Tech CSE", score: "2025 - 2029", detail: "VIT Chennai" },
    { level: "AISSCE (CBSE Class 12)", score: "90%", detail: "2024–25" },
    { level: "AISSE (CBSE Class 10)", score: "94%", detail: "2022–23" },
  ],
  github: "https://github.com/codecrusader07",
  linkedin: "https://linkedin.com/in/anas-arfeen",
  portfolio: "https://anasarfeen.dev",
  resumePath: "/Resume.pdf",
  avatarPath: "/Photo.jpg",
  location: "Chennai, India",
  brandStatement: "AI Engineer + Systems & Full Stack Developer + Research-Oriented Builder",
};

export const PROJECTS: Project[] = [
  {
    id: "rover",
    title: "Autonomous Warehouse Rover",
    subtitle: "Deep Reinforcement Learning Navigation Agent with Curriculum Learning",
    category: "AI/ML",
    tags: ["Python", "PyTorch", "Stable-Baselines3", "PPO", "SAC", "Curriculum Learning", "MVC Engine"],
    description: "Engineered an intelligent reinforcement learning rover capable of navigating dynamic warehouse obstacles using Proximal Policy Optimization (PPO) and Soft Actor-Critic (SAC). Built a custom simulation and rendering engine from scratch following Model-View-Controller (MVC) architecture.",
    problem: "Traditional rule-based warehouse bots struggle with real-time dynamic obstacle avoidance and layout reconfiguration without manual path re-calculation.",
    solution: "Designed an end-to-end RL pipeline with progressive curriculum learning, training the agent across scalar obstacle densities to guarantee high convergence and collision avoidance.",
    impact: "Achieved 98.4% navigation success rate on randomized grid maps while maintaining optimal path distance efficiency.",
    architecture: [
      "Environment Core: Custom 2D Grid Gym-compatible simulation engine (MVC Pattern)",
      "Policy Network: Multi-layer Perceptron (MLP) with PPO & SAC optimization",
      "Curriculum Manager: Dynamic difficulty scaler adjusting obstacle density upon reward threshold",
      "Telemetry HUD: Real-time action-value Q-map visualizer built in Pygame/Python"
    ],
    githubUrl: "https://github.com/codecrusader07",
    featured: true,
    status: "Active R&D",
    metrics: [
      { label: "Success Rate", value: "98.4%" },
      { label: "Algorithm", value: "PPO / SAC" },
      { label: "Framework", value: "PyTorch" }
    ]
  },
  {
    id: "musicalterm",
    title: "MusicalTerm",
    subtitle: "Aesthetic CLI Audio Player tailored for Terminal-First Engineers",
    category: "Systems",
    tags: ["Python", "Linux / Arch", "Terminal UI", "Audio Processing", "Neovim Ecosystem"],
    description: "Built a minimal, aesthetic terminal-based audio player engineered for developer workflows. Features vim-style keybindings, visualizer spectrum analysis, and instantaneous audio controls right inside standard terminal emulators.",
    problem: "GUI music players consume heavy system RAM and break focus for terminal-heavy developer environments (Arch/Neovim).",
    solution: "Developed a lightweight TUI audio engine using Python terminal primitives, featuring customized ASCII audio visualizers and low latency audio decoding.",
    impact: "Zero GUI overhead (<15MB RAM footprint) enabling seamless background audio control during high-intensity coding sessions.",
    architecture: [
      "Audio Backend: Low-latency decoding pipeline with async buffer management",
      "UI Layer: Custom TUI event loop with ANSI color support & ASCII spectrum analyzer",
      "Keybindings: Vim-inspired navigation (`h`, `j`, `k`, `l`, space toggle, quick search)"
    ],
    githubUrl: "https://github.com/codecrusader07",
    featured: true,
    status: "Open Source",
    metrics: [
      { label: "Memory Footprint", value: "<15 MB" },
      { label: "Interface", value: "Vim TUI" },
      { label: "Platform", value: "Linux / macOS" }
    ]
  },
  {
    id: "signalmapper",
    title: "Campus Signal Mapper",
    subtitle: "Crowd-Sourced Carrier Telemetry & Dynamic Heatmap Generator",
    category: "Web & Tools",
    tags: ["JavaScript", "HTML5 Canvas", "Heatmap.js", "Crowd-Sourcing", "VIT Chennai"],
    description: "Created an interactive geospatial visualization tool mapping real-time cellular signal performance (Jio, Airtel, Vi) across the VIT Chennai campus footprint.",
    problem: "Students experience inconsistent cellular signals across academic blocks, hostel areas, and lab complexes without clear coverage data.",
    solution: "Engineered a crowd-sourced signal collection portal paired with a dynamic client-side canvas heatmap engine that renders signal strength overlays in real time.",
    impact: "Mapped over 50+ campus zones with precise RSSI metrics, empowering students and visitors to identify optimal connectivity nodes.",
    architecture: [
      "Frontend Engine: Vanilla JavaScript with responsive HTML5 Canvas spatial renderer",
      "Interpolation: Inverse Distance Weighting (IDW) algorithm for smooth gradient heatmaps",
      "Data Collector: Mobile telemetry input module with network type detection"
    ],
    githubUrl: "https://github.com/codecrusader07",
    featured: true,
    status: "Deployed",
    metrics: [
      { label: "Campus Coverage", value: "50+ Zones" },
      { label: "Visualizer", value: "Canvas Heatmap" },
      { label: "Carriers", value: "Jio / Airtel / Vi" }
    ]
  },
  {
    id: "celebclassifier",
    title: "Celeb Classifier",
    subtitle: "Deep Learning Facial Similarity & Feature Matching System (GNU GPL v3)",
    category: "Deep Learning",
    tags: ["Python", "ResNet50", "PyTorch", "Computer Vision", "Open Source", "Deep Learning"],
    description: "Architected a deep learning similarity matching web app leveraging a fine-tuned ResNet50 neural network for high-accuracy facial feature vector extraction.",
    problem: "Standard facial classifiers struggle with varying lighting, facial angles, and low-resolution input images.",
    solution: "Fine-tuned ResNet50 on facial dataset embeddings utilizing Cosine Distance metric calculation on high-dimensional latent space representations.",
    impact: "Published as open-source software under GNU GPL v3 to promote open AI research and transparent dataset evaluation.",
    architecture: [
      "Feature Extractor: ResNet50 pre-trained backbone stripped of classification head",
      "Vector Index: Cosine similarity search across target facial embedding index",
      "Web Layer: Python micro-service serving real-time vector inference endpoints"
    ],
    githubUrl: "https://github.com/codecrusader07",
    featured: true,
    status: "Open Source",
    metrics: [
      { label: "Backbone", value: "ResNet50" },
      { label: "License", value: "GNU GPL v3" },
      { label: "Metric", value: "Cosine Similarity" }
    ]
  },
  {
    id: "snakeai",
    title: "Snake - AI Edition",
    subtitle: "Autonomous Game Solver with Real-Time A* Search & Greedy Heuristics",
    category: "AI/ML",
    tags: ["Python", "Pygame", "A* Search", "Greedy Search", "Graph Algorithms", "Heuristics"],
    description: "Reconstructed the classic Snake game featuring an automated decision-making bot powered by dynamic pathfinding search algorithms (Greedy & A*).",
    problem: "Real-time automated snake navigation frequently gets trapped in self-encircling loops as snake body length scales up.",
    solution: "Implemented dual-mode graph search: A* for short-path target acquisition and defensive longest-path Hamiltonian heuristic fallback when trapped.",
    impact: "Achieved near-perfect board coverage in 95% of game runs with zero human intervention.",
    architecture: [
      "Game Engine: Custom event-loop renderer built with Pygame",
      "Pathfinder: A* graph search with Manhattan distance heuristic",
      "Fallback Engine: Defensive space-filling tail tracking algorithm"
    ],
    githubUrl: "https://github.com/codecrusader07",
    featured: false,
    status: "Open Source",
    metrics: [
      { label: "Pathfinder", value: "A* / Greedy" },
      { label: "Efficiency", value: "O(V log V)" },
      { label: "Board Fill", value: "95% Max" }
    ]
  }
];

export const SKILLS: SkillNode[] = [
  // AI/ML & RL
  {
    name: "PyTorch",
    category: "AI/ML & RL",
    level: 92,
    iconName: "BrainCircuit",
    description: "Deep learning tensor computation, custom loss functions, and neural architecture fine-tuning (ResNet50, MLPs).",
    relatedProjects: ["Autonomous Warehouse Rover", "Celeb Classifier"],
    snippet: "import torch\nimport torch.nn as nn\npolicy = nn.Sequential(nn.Linear(state_dim, 256), nn.ReLU(), nn.Linear(256, action_dim))"
  },
  {
    name: "Reinforcement Learning (PPO / SAC)",
    category: "AI/ML & RL",
    level: 90,
    iconName: "Zap",
    description: "Proximal Policy Optimization & Soft Actor-Critic algorithm implementation, reward shaping, and curriculum learning.",
    relatedProjects: ["Autonomous Warehouse Rover"],
    snippet: "from stable_baselines3 import PPO\nmodel = PPO('MlpPolicy', env, verbose=1, learning_rate=3e-4)\nmodel.learn(total_timesteps=100000)"
  },
  {
    name: "Computer Vision & ResNet50",
    category: "AI/ML & RL",
    level: 88,
    iconName: "Eye",
    description: "Facial feature vector extraction, image pre-processing pipelines, and convolutional feature mapping.",
    relatedProjects: ["Celeb Classifier"],
    snippet: "import torchvision.models as models\nbackbone = models.resnet50(pretrained=True)\nfeatures = torch.nn.Sequential(*list(backbone.children())[:-1])"
  },
  {
    name: "NumPy & SciPy",
    category: "AI/ML & RL",
    level: 94,
    iconName: "Cpu",
    description: "Matrix transformations, vector math, statistical telemetry, and fast scientific computation.",
    relatedProjects: ["Autonomous Warehouse Rover", "Campus Signal Mapper"],
    snippet: "import numpy as np\ndistances = np.sqrt(np.sum((points - query_pt)**2, axis=1))"
  },
  // Languages & Systems
  {
    name: "Python",
    category: "Languages & Systems",
    level: 96,
    iconName: "Code",
    description: "Core engineering language for AI pipelines, CLI tools, simulation engines, and algorithm implementation.",
    relatedProjects: ["Warehouse Rover", "MusicalTerm", "Celeb Classifier", "Snake AI"],
    snippet: "class Agent:\n    def __init__(self, env):\n        self.env = env\n    def act(self, obs):\n        return self.policy.predict(obs)"
  },
  {
    name: "C++ / C",
    category: "Languages & Systems",
    level: 86,
    iconName: "Terminal",
    description: "High-performance systems programming, memory management, pointers, and data structure optimizations.",
    relatedProjects: ["Systems & DSA Benchmarks"],
    snippet: "#include <iostream>\ntemplate<typename T>\nclass PriorityQueue { /* O(log N) fast heap */ };"
  },
  {
    name: "JavaScript / HTML / CSS",
    category: "Languages & Systems",
    level: 90,
    iconName: "Globe",
    description: "Interactive web applications, Canvas spatial graphics, heatmap renderers, and modern frontend UIs.",
    relatedProjects: ["Campus Signal Mapper", "Portfolio OS"],
    snippet: "const ctx = canvas.getContext('2d');\nctx.fillStyle = 'rgba(0, 240, 255, 0.8)';\nctx.arc(x, y, radius, 0, Math.PI * 2);"
  },
  {
    name: "C#",
    category: "Languages & Systems",
    level: 78,
    iconName: "FileCode",
    description: "Object-oriented software development and game engine scripts.",
    relatedProjects: ["Simulation Prototypes"]
  },
  // Developer Ecosystem & Linux
  {
    name: "Linux (Arch Linux)",
    category: "Developer Ecosystem",
    level: 95,
    iconName: "Server",
    description: "Advanced Linux system administration, custom kernel ricing, shell scripting, and terminal workflow optimization.",
    relatedProjects: ["MusicalTerm", "LUG Workshops"],
    snippet: "pacman -Syu neovim tmux zsh git bspwm\nalias rice='nvim ~/.config/nvim/init.lua'"
  },
  {
    name: "Neovim & Git",
    category: "Developer Ecosystem",
    level: 94,
    iconName: "Edit3",
    description: "Keyboard-driven modal editing, Lua plugin ricing, version control, branching strategies, and CI/CD.",
    relatedProjects: ["All Projects", "Open Source GPL v3"],
    snippet: "vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = 'Telescope find files' })"
  },
  {
    name: "Pygame & Simulation Engines",
    category: "Developer Ecosystem",
    level: 88,
    iconName: "Gamepad2",
    description: "Custom 2D physics environments, frame-rate control, game loops, and visual telemetry dashboards.",
    relatedProjects: ["Snake - AI Edition", "Autonomous Rover Simulator"]
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    role: "AI/ML Co-Lead",
    organization: "Microsoft Innovations Club (MIC)",
    location: "VIT Chennai",
    period: "2026 – Present",
    current: true,
    type: "Leadership",
    highlights: [
      "Orchestrate AI/ML-focused hands-on workshops and technical initiatives for 500+ student developers.",
      "Mentor student cohorts in modern machine learning workflows, PyTorch pipelines, and production AI tooling.",
      "Direct technical planning and build automated community management tools to streamline event execution."
    ],
    techUsed: ["Python", "PyTorch", "Community Mentorship", "AI Workshops", "Automation"]
  },
  {
    role: "AI/ML Member",
    organization: "Microsoft Innovations Club (MIC)",
    location: "VIT Chennai",
    period: "2025 – 2026",
    current: false,
    type: "Technical",
    highlights: [
      "Contributed to collaborative technical projects and participated in advanced neural network study sessions.",
      "Built internal AI prototypes and engaged in hackathon sprints representing the MIC chapter."
    ],
    techUsed: ["Deep Learning", "Tensor Flow", "PyTorch", "Git Collaboration"]
  },
  {
    role: "Technical Member",
    organization: "Linux User Group (LUG)",
    location: "VIT Chennai",
    period: "2025 – 2026",
    current: false,
    type: "Technical",
    highlights: [
      "Advocated for open-source software ecosystems and Unix philosophy principles across campus.",
      "Conducted interactive terminal ricing, shell scripting, and Arch Linux setup sessions for developers."
    ],
    techUsed: ["Arch Linux", "Shell Scripting", "Neovim", "Open Source Advocacy"]
  },
  {
    role: "AI/ML Member",
    organization: "Hack Club",
    location: "VIT Chennai",
    period: "2025 – Present",
    current: true,
    type: "Technical",
    highlights: [
      "Participate in student-led rapid prototype builds and collaborative open-source sprints.",
      "Co-host peer-to-peer coding sessions and real-time algorithmic problem solving."
    ],
    techUsed: ["Algorithms", "Prototyping", "Peer Coding", "Hackathons"]
  }
];

export const JOURNEY: JourneyMilestone[] = [
  {
    year: "2022 - 2024",
    title: "Core Foundations & Systems Curiosity",
    subtitle: "High School CBSE Excellence (Class 10: 94% | Class 12: 90%)",
    description: "Discovered computer science primitives, object-oriented logic in C++/Python, and fell in love with Unix terminal environments.",
    icon: "Terminal",
    tag: "Genesis"
  },
  {
    year: "2025",
    title: "VIT Chennai B.Tech CSE & Linux Ricing",
    subtitle: "Entered VIT Chennai Computer Science Engineering",
    description: "Joined LUG, MIC, and Hack Club. Immersed in Arch Linux customization, Neovim ricing, and systems programming.",
    icon: "Cpu",
    tag: "Systems"
  },
  {
    year: "2025 - 2026",
    title: "Deep Reinforcement Learning & Open Source",
    subtitle: "Built Autonomous Rover & Celeb Classifier (GPL v3)",
    description: "Engineered custom PyTorch RL simulation engines using PPO/SAC. Open-sourced deep learning facial classifier under GNU GPL v3.",
    icon: "Brain",
    tag: "AI & RL"
  },
  {
    year: "2026 - Present",
    title: "MIC AI/ML Co-Lead & Intelligent Systems",
    subtitle: "Leading Student AI Research & Technical Workshops",
    description: "Spearheading community AI initiatives at VIT Chennai while advancing research in RL curriculum strategies and high-performance developer tooling.",
    icon: "Rocket",
    tag: "Leadership"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    title: "AI/ML Co-Lead Appointment",
    category: "Leadership",
    date: "2026",
    issuer: "Microsoft Innovations Club (MIC), VIT Chennai",
    description: "Promoted to Co-Lead for demonstrating technical rigor, mentorship excellence, and project leadership.",
    badgeText: "LEADERSHIP"
  },
  {
    title: "Open Source GNU GPL v3 Release",
    category: "Open Source",
    date: "2025",
    issuer: "Celeb Classifier Repository",
    description: "Published ResNet50 facial embedding matching framework under GNU GPL v3 for public research access.",
    badgeText: "GPL v3"
  },
  {
    title: "Autonomous Navigation Breakthrough",
    category: "R&D",
    date: "2025",
    issuer: "Autonomous Rover Simulation",
    description: "Achieved 98.4% navigation success rate on randomized obstacle maps using PPO + Curriculum Learning.",
    badgeText: "98.4% ACCURACY"
  },
  {
    title: "Campus Telecom Telemetry Deployment",
    category: "Impact",
    date: "2025",
    issuer: "Campus Signal Mapper",
    description: "Successfully mapped carrier coverage across 50+ zones on VIT Chennai campus footprint.",
    badgeText: "50+ ZONES"
  }
];

export const ARTICLES: Article[] = [
  {
    id: "ppo-vs-sac",
    title: "PPO vs. SAC in Dynamic Warehouse Grid Navigation",
    summary: "A comparative evaluation of on-policy Proximal Policy Optimization vs. off-policy Soft Actor-Critic for obstacle avoidance in PyTorch.",
    date: "July 2026",
    readTime: "6 min read",
    tags: ["Reinforcement Learning", "PyTorch", "PPO", "Robotics"],
    contentSnippet: `// Excerpt from Anas Arfeen's Notebook:
When training an autonomous rover on discrete grid coordinates, reward sparsity can cause policy collapse. 
By introducing a Curriculum Scaling Manager, we increment obstacle density from 10% to 45% only when the rolling average reward hits 0.85...`
  },
  {
    id: "arch-neovim-ricing",
    title: "Ricing Arch Linux & Neovim for Zero-Latency AI Development",
    summary: "How configuring a minimal, keyboard-driven Linux environment boosts focus and reduces context-switching during neural network training.",
    date: "May 2026",
    readTime: "4 min read",
    tags: ["Linux", "Arch Linux", "Neovim", "Developer Productivity"],
    contentSnippet: `// Excerpt from Anas Arfeen's Notebook:
GUI IDEs often consume 2GB+ of memory before a single tensor is allocated. Switching to Neovim with Lua LSP configs, tmux, and custom keybindings reduced idle RAM usage to <250MB on Arch Linux...`
  },
  {
    id: "astar-heuristics",
    title: "Real-Time Pathfinding: A* Search & Defensive Fallbacks in Grid Solvers",
    summary: "Engineering deterministic graph search heuristics for real-time game agents without hitting encirclement traps.",
    date: "March 2026",
    readTime: "5 min read",
    tags: ["Algorithms", "Pathfinding", "A* Search", "Python"],
    contentSnippet: `// Excerpt from Anas Arfeen's Notebook:
Standard Manhattan heuristics in A* search prioritize the shortest distance to target. However, when the snake body grows, greedy targeting causes self-trapping. The solution is a dual-state state machine...`
  }
];
