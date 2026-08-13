---
title: 'A Hybrid Brain for Competitive Pokémon: Heuristics First, LLM Second'
excerpt: >-
  Pure heuristics miss deep strategy. Pure LLMs are too slow for every turn.
  Here's why poke-ai splits the decision loop between the two instead of picking
  one.
date: '2026-07-25'
tags:
  - LLM Integration
  - Game AI
  - Docker
readingTime: 5 min read
projectId: poke_ai
---
Competitive Pokémon (Gen 9 National Dex OU) is a surprisingly good benchmark for decision-making AI: every turn has a large but bounded action space, correctness is partly computable (type effectiveness, speed tiers, damage ranges) and partly about longer-horizon strategy (win conditions, prediction, resource trading) that's much harder to hand-code.

That split is exactly why a single-approach agent struggles. A pure heuristic scorer is fast and consistent but shallow — it can rank "this move deals more damage" but not "this move sets up a win condition three turns from now." A pure LLM agent can reason about the latter, but re-prompting a language model for every single decision point in a battle is far too slow and expensive to be practical.

## The hybrid loop

- A heuristic move-scorer runs first and narrows the legal action space down to a short, ranked list of plausible moves — this is the fast path, and it's what fires most of the time for obviously-correct decisions
- For turns where the heuristic scores are close or the situation is strategically loaded (low HP thresholds, potential switches, win-condition turns), the shortlist gets handed to an LLM to reason over and pick from
- The LLM backend is swappable at runtime — Gemini, Ollama (local), or Puter — selectable live from the UI, not hardcoded at build time

```text
Turn state
   │
   ▼
Heuristic scorer  ──►  clear best move? ──► play it (fast path)
   │
   ▼ (ambiguous / high-stakes)
Shortlist of top-N moves
   │
   ▼
LLM reasons over shortlist ──► play the chosen move
```

## Why it has to run against a real battle server

The agent plays against a self-hosted Pokémon Showdown server rather than a simplified simulator, on purpose. Showdown enforces the actual battle rules, timing, and edge cases (ability interactions, item triggers, speed ties) that a simplified reimplementation would inevitably get subtly wrong. Building against the real thing meant the hard parts of the project were about the decision loop, not about re-deriving Pokémon's rule engine.

> **Where this was built**
>
> poke-ai was built for Microsoft Innovations Club's Club Expo — a live, working demonstration that an LLM can make real-time tactical decisions under a hard latency budget, instead of just narrating strategy in a chat window.

## What's still rough

The heuristic/LLM handoff threshold is currently a fixed score-gap cutoff, which is a blunt instrument — it doesn't adapt to how confident the heuristic actually is in a given matchup. A calibrated confidence estimate (rather than a fixed gap) would route to the LLM more precisely, which is the next thing on the list.
