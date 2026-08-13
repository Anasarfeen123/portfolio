---
title: "Building AmazeCC: What It Actually Takes to Replace a University Portal"
excerpt: "Notes from building a ~130-route production platform that real VIT students use instead of VTOP — on why the hard part was never the dashboard."
date: "2026-07-05"
tags: ["Next.js", "PostgreSQL", "Product Engineering"]
readingTime: "7 min read"
projectId: "amazecc"
---

VIT's official student portal, VTOP, works — technically. But checking attendance, grades, the hostel mess menu, library dues, and fee payments means logging into (or navigating around) half a dozen different fragmented flows. AmazeCC started as an obvious idea: put all of it in one dashboard. The obvious idea turned out to be the easy 10% of the project.

## The dashboard is not the hard part

A unified UI over attendance, grades, timetable, hostel, library, and events is a straightforward frontend problem once you have clean data. What's actually hard is everything upstream of that: scraping and normalizing data from systems that were never designed to be integrated with, keeping that data fresh without hammering upstream services, and doing all of it reliably enough that students trust the number on screen over the one in the original portal.

- A ~130-route API layer over PostgreSQL, because every academic data type (attendance, CGPA, timetable, hostel) has its own shape, refresh cadence, and edge cases
- A caching and refresh strategy so the dashboard feels instant without re-scraping on every page load
- An installable PWA with offline support and push notifications, so it behaves like a native app for the thing students check most: today's attendance percentage

## Designing for a userbase that will actually complain

The difference between a class project and AmazeCC is that real students depend on the attendance number being right before a bunk-or-attend decision. That constraint changes how you build. Silent failures are not acceptable — if a data source is stale or unreachable, the UI has to say so, not quietly show old numbers as if they were current. We ended up building explicit staleness indicators and fallbacks rather than trusting a single source of truth blindly.

> The fastest way to lose a userbase like this isn't a bug — it's a bug that lies to them confidently.

That pressure also shaped the ecosystem beyond the main web app. We built a separate admin dashboard for operational visibility, an API that's genuinely reusable (we later built both a Kotlin Multiplatform mobile client and a Go terminal client against the exact same endpoints with no special-casing), and notification tooling — 10 categories with configurable lead time — because "remind me before I lose attendance eligibility" is a feature people actually asked for, not one we guessed at.

## What I'd tell someone starting a similar project

1. Design the API for multiple future clients from day one, even if you only ship one client first — it costs little upfront and saves a rewrite later.
2. Treat data freshness as a first-class UI concern, not an implementation detail users never see.
3. Real users file real issues about real edge cases you didn't think of — budget engineering time for that feedback loop, not just the initial build.
