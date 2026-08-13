---
title: "Teaching a Rover to Stop Hitting Shelves: Curriculum Learning with PPO"
excerpt: "Why a warehouse rover trained directly on hard layouts never learns anything, and how promoting it through four difficulty tiers at an 80% success threshold fixed that."
date: "2026-04-02"
tags: ["Reinforcement Learning", "PyTorch", "Robotics"]
readingTime: "6 min read"
projectId: "rover"
---

The first version of the warehouse rover agent never left the loading dock. Literally — I dropped a PPO agent into a dense warehouse layout with narrow shelf gaps and watched it learn to spin in place, because every trajectory that tried to move ended in a wall collision and a negative reward. The reward signal was too sparse and too punishing for anything useful to emerge from random exploration.

That's the classic failure mode for reinforcement learning on hard tasks: if the agent can't stumble into partial success early on, there's no gradient to climb. The fix wasn't a better reward function — it was curriculum learning.

## The setup

The rover is a differential-drive robot in a custom Gymnasium environment. Its only observations are 15 simulated lidar rays plus its relative heading to the target — no privileged map data, no global path planner. It has to learn navigation purely from geometry it can sense in the moment.

- Stable-Baselines3 PPO with frame stacking (4 recent lidar frames) so the policy has some sense of motion, not just a single static scan
- 8 parallel vectorized environments during training to keep sample throughput reasonable on a single GPU
- A shaped reward: small continuous reward for reducing distance-to-target, a collision penalty, and a large terminal reward for reaching the goal

## Four tiers, one promotion rule

Instead of training on the final warehouse layout from step zero, I built four layouts of increasing density — from an open floor with no obstacles to a full warehouse with narrow shelf-gap corridors. The agent starts on tier 1 and only gets promoted to the next tier once its rolling success rate (measured over the last N episodes) crosses 80%.

```python
if rolling_success_rate(window=100) >= 0.80:
    current_tier = min(current_tier + 1, MAX_TIER)
    env.set_layout(LAYOUTS[current_tier])
    print(f"Promoted to tier {current_tier}")
```

The 80% threshold matters more than it looks. Too low, and the policy gets pushed into harder layouts before it's actually reliable, which reintroduces the sparse-reward problem one tier later. Too high, and training stalls chasing the last few percent on an easy tier instead of spending that compute where it's needed. 80% turned out to be the point where the policy was confident enough to have transferable behavior — general obstacle-avoidance and heading-correction habits — rather than layout-specific memorization.

> **What actually changed**
>
> Direct training on the hardest layout: the agent never crossed a ~12% success rate in 2M steps. With curriculum promotion, it hit 80%+ on the hardest tier by roughly 1.4M steps — and importantly, most of that policy was already learned on the easier tiers, so the hard-tier training itself converged fast.

## What I'd change next

The lidar-only observation space is deliberately restrictive — it's what makes the result interesting, since the agent has to infer everything from local geometry. But it also means the policy has no memory of the map beyond the current frame stack, so it occasionally re-explores the same dead end. The obvious next step is adding a small recurrent layer (an LSTM head instead of pure frame stacking) so the policy can carry longer-horizon spatial memory. That's the next experiment.
