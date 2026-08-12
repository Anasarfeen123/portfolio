export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; label: string; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. 2026-07-25 */
  date: string;
  tags: string[];
  readingTime: string;
  /** Optional id into projects[] this post is about — renders a linked project card. */
  projectId?: string;
  content: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "curriculum-learning-warehouse-rover",
    title: "Teaching a Rover to Stop Hitting Shelves: Curriculum Learning with PPO",
    excerpt:
      "Why a warehouse rover trained directly on hard layouts never learns anything, and how promoting it through four difficulty tiers at an 80% success threshold fixed that.",
    date: "2026-04-02",
    tags: ["Reinforcement Learning", "PyTorch", "Robotics"],
    readingTime: "6 min read",
    projectId: "rover",
    content: [
      {
        type: "p",
        text: "The first version of the warehouse rover agent never left the loading dock. Literally — I dropped a PPO agent into a dense warehouse layout with narrow shelf gaps and watched it learn to spin in place, because every trajectory that tried to move ended in a wall collision and a negative reward. The reward signal was too sparse and too punishing for anything useful to emerge from random exploration.",
      },
      {
        type: "p",
        text: "That's the classic failure mode for reinforcement learning on hard tasks: if the agent can't stumble into partial success early on, there's no gradient to climb. The fix wasn't a better reward function — it was curriculum learning.",
      },
      { type: "h2", text: "The setup" },
      {
        type: "p",
        text: "The rover is a differential-drive robot in a custom Gymnasium environment. Its only observations are 15 simulated lidar rays plus its relative heading to the target — no privileged map data, no global path planner. It has to learn navigation purely from geometry it can sense in the moment.",
      },
      {
        type: "list",
        items: [
          "Stable-Baselines3 PPO with frame stacking (4 recent lidar frames) so the policy has some sense of motion, not just a single static scan",
          "8 parallel vectorized environments during training to keep sample throughput reasonable on a single GPU",
          "A shaped reward: small continuous reward for reducing distance-to-target, a collision penalty, and a large terminal reward for reaching the goal",
        ],
      },
      { type: "h2", text: "Four tiers, one promotion rule" },
      {
        type: "p",
        text: "Instead of training on the final warehouse layout from step zero, I built four layouts of increasing density — from an open floor with no obstacles to a full warehouse with narrow shelf-gap corridors. The agent starts on tier 1 and only gets promoted to the next tier once its rolling success rate (measured over the last N episodes) crosses 80%.",
      },
      {
        type: "code",
        lang: "python",
        code: `if rolling_success_rate(window=100) >= 0.80:
    current_tier = min(current_tier + 1, MAX_TIER)
    env.set_layout(LAYOUTS[current_tier])
    print(f"Promoted to tier {current_tier}")`,
      },
      {
        type: "p",
        text: "The 80% threshold matters more than it looks. Too low, and the policy gets pushed into harder layouts before it's actually reliable, which reintroduces the sparse-reward problem one tier later. Too high, and training stalls chasing the last few percent on an easy tier instead of spending that compute where it's needed. 80% turned out to be the point where the policy was confident enough to have transferable behavior — general obstacle-avoidance and heading-correction habits — rather than layout-specific memorization.",
      },
      {
        type: "callout",
        label: "What actually changed",
        text: "Direct training on the hardest layout: the agent never crossed a ~12% success rate in 2M steps. With curriculum promotion, it hit 80%+ on the hardest tier by roughly 1.4M steps — and importantly, most of that policy was already learned on the easier tiers, so the hard-tier training itself converged fast.",
      },
      { type: "h2", text: "What I'd change next" },
      {
        type: "p",
        text: "The lidar-only observation space is deliberately restrictive — it's what makes the result interesting, since the agent has to infer everything from local geometry. But it also means the policy has no memory of the map beyond the current frame stack, so it occasionally re-explores the same dead end. The obvious next step is adding a small recurrent layer (an LSTM head instead of pure frame stacking) so the policy can carry longer-horizon spatial memory. That's the next experiment.",
      },
    ],
  },
  {
    slug: "building-amazecc-replacing-vtop",
    title: "Building AmazeCC: What It Actually Takes to Replace a University Portal",
    excerpt:
      "Notes from building a ~130-route production platform that real VIT students use instead of VTOP — on why the hard part was never the dashboard.",
    date: "2026-07-05",
    tags: ["Next.js", "PostgreSQL", "Product Engineering"],
    readingTime: "7 min read",
    projectId: "amazecc",
    content: [
      {
        type: "p",
        text: "VIT's official student portal, VTOP, works — technically. But checking attendance, grades, the hostel mess menu, library dues, and fee payments means logging into (or navigating around) half a dozen different fragmented flows. AmazeCC started as an obvious idea: put all of it in one dashboard. The obvious idea turned out to be the easy 10% of the project.",
      },
      { type: "h2", text: "The dashboard is not the hard part" },
      {
        type: "p",
        text: "A unified UI over attendance, grades, timetable, hostel, library, and events is a straightforward frontend problem once you have clean data. What's actually hard is everything upstream of that: scraping and normalizing data from systems that were never designed to be integrated with, keeping that data fresh without hammering upstream services, and doing all of it reliably enough that students trust the number on screen over the one in the original portal.",
      },
      {
        type: "list",
        items: [
          "A ~130-route API layer over PostgreSQL, because every academic data type (attendance, CGPA, timetable, hostel) has its own shape, refresh cadence, and edge cases",
          "A caching and refresh strategy so the dashboard feels instant without re-scraping on every page load",
          "An installable PWA with offline support and push notifications, so it behaves like a native app for the thing students check most: today's attendance percentage",
        ],
      },
      { type: "h2", text: "Designing for a userbase that will actually complain" },
      {
        type: "p",
        text: "The difference between a class project and AmazeCC is that real students depend on the attendance number being right before a bunk-or-attend decision. That constraint changes how you build. Silent failures are not acceptable — if a data source is stale or unreachable, the UI has to say so, not quietly show old numbers as if they were current. We ended up building explicit staleness indicators and fallbacks rather than trusting a single source of truth blindly.",
      },
      {
        type: "quote",
        text: "The fastest way to lose a userbase like this isn't a bug — it's a bug that lies to them confidently.",
      },
      {
        type: "p",
        text: "That pressure also shaped the ecosystem beyond the main web app. We built a separate admin dashboard for operational visibility, an API that's genuinely reusable (we later built both a Kotlin Multiplatform mobile client and a Go terminal client against the exact same endpoints with no special-casing), and notification tooling — 10 categories with configurable lead time — because 'remind me before I lose attendance eligibility' is a feature people actually asked for, not one we guessed at.",
      },
      { type: "h2", text: "What I'd tell someone starting a similar project" },
      {
        type: "list",
        ordered: true,
        items: [
          "Design the API for multiple future clients from day one, even if you only ship one client first — it costs little upfront and saves a rewrite later.",
          "Treat data freshness as a first-class UI concern, not an implementation detail users never see.",
          "Real users file real issues about real edge cases you didn't think of — budget engineering time for that feedback loop, not just the initial build.",
        ],
      },
    ],
  },
  {
    slug: "hybrid-brain-for-competitive-pokemon",
    title: "A Hybrid Brain for Competitive Pokémon: Heuristics First, LLM Second",
    excerpt:
      "Pure heuristics miss deep strategy. Pure LLMs are too slow for every turn. Here's why poke-ai splits the decision loop between the two instead of picking one.",
    date: "2026-07-25",
    tags: ["LLM Integration", "Game AI", "Docker"],
    readingTime: "5 min read",
    projectId: "poke_ai",
    content: [
      {
        type: "p",
        text: "Competitive Pokémon (Gen 9 National Dex OU) is a surprisingly good benchmark for decision-making AI: every turn has a large but bounded action space, correctness is partly computable (type effectiveness, speed tiers, damage ranges) and partly about longer-horizon strategy (win conditions, prediction, resource trading) that's much harder to hand-code.",
      },
      {
        type: "p",
        text: "That split is exactly why a single-approach agent struggles. A pure heuristic scorer is fast and consistent but shallow — it can rank 'this move deals more damage' but not 'this move sets up a win condition three turns from now.' A pure LLM agent can reason about the latter, but re-prompting a language model for every single decision point in a battle is far too slow and expensive to be practical.",
      },
      { type: "h2", text: "The hybrid loop" },
      {
        type: "list",
        items: [
          "A heuristic move-scorer runs first and narrows the legal action space down to a short, ranked list of plausible moves — this is the fast path, and it's what fires most of the time for obviously-correct decisions",
          "For turns where the heuristic scores are close or the situation is strategically loaded (low HP thresholds, potential switches, win-condition turns), the shortlist gets handed to an LLM to reason over and pick from",
          "The LLM backend is swappable at runtime — Gemini, Ollama (local), or Puter — selectable live from the UI, not hardcoded at build time",
        ],
      },
      {
        type: "code",
        lang: "text",
        code: `Turn state
   │
   ▼
Heuristic scorer  ──►  clear best move? ──► play it (fast path)
   │
   ▼ (ambiguous / high-stakes)
Shortlist of top-N moves
   │
   ▼
LLM reasons over shortlist ──► play the chosen move`,
      },
      { type: "h2", text: "Why it has to run against a real battle server" },
      {
        type: "p",
        text: "The agent plays against a self-hosted Pokémon Showdown server rather than a simplified simulator, on purpose. Showdown enforces the actual battle rules, timing, and edge cases (ability interactions, item triggers, speed ties) that a simplified reimplementation would inevitably get subtly wrong. Building against the real thing meant the hard parts of the project were about the decision loop, not about re-deriving Pokémon's rule engine.",
      },
      {
        type: "callout",
        label: "Where this was built",
        text: "poke-ai was built for Microsoft Innovations Club's Club Expo — a live, working demonstration that an LLM can make real-time tactical decisions under a hard latency budget, instead of just narrating strategy in a chat window.",
      },
      { type: "h2", text: "What's still rough" },
      {
        type: "p",
        text: "The heuristic/LLM handoff threshold is currently a fixed score-gap cutoff, which is a blunt instrument — it doesn't adapt to how confident the heuristic actually is in a given matchup. A calibrated confidence estimate (rather than a fixed gap) would route to the LLM more precisely, which is the next thing on the list.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAdjacentPosts(slug: string): { prev?: BlogPost; next?: BlogPost } {
  const sorted = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
  const idx = sorted.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return { prev: sorted[idx + 1], next: sorted[idx - 1] };
}
