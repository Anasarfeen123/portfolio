"use client";

import { useEffect, useState } from "react";

type ContributionDay = { date: string; contributionCount: number };
type ContributionCalendar = { totalContributions: number; weeks: { contributionDays: ContributionDay[] }[] };

const CELL = 10;
const GAP = 2;

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Public-facing, same fail-silent contract as GitHubActivityFeed — if the
 * proxy route isn't configured (no GITHUB_STATS_TOKEN) or the fetch fails,
 * this renders nothing rather than showing an error to site visitors. */
export function ContributionGraph() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/github-contributions")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: ContributionCalendar) => {
        if (isMounted) setCalendar(data);
      })
      .catch(() => {
        if (isMounted) setFailed(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (failed || !calendar) return null;

  const weeks = calendar.weeks;
  const width = weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  return (
    <div className="mt-4 viz">
      {/* height is intentionally omitted (not a fixed pixel value) — the
          viewBox's aspect ratio (~7.5:1, weeks × days) is much wider than a
          narrow mobile card, so a fixed height here would force
          preserveAspectRatio's default "meet" scaling to shrink the graph
          to fit that width, leaving dead vertical space above/below rather
          than actually filling the box. aspectRatio keeps width and height
          scaling together at every viewport size. */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ aspectRatio: `${width} / ${height}` }}
        role="img"
        aria-label="GitHub contribution graph"
      >
        {weeks.map((week, wi) =>
          week.contributionDays.map((day, di) => {
            const level = levelFor(day.contributionCount);
            return (
              <rect
                key={day.date}
                x={wi * (CELL + GAP)}
                y={di * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={`var(--viz-seq-${level})`}
              >
                <title>
                  {day.contributionCount} contribution{day.contributionCount === 1 ? "" : "s"} on{" "}
                  {new Date(day.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </title>
              </rect>
            );
          })
        )}
      </svg>
      <div className="mt-1.5 text-[10px] font-mono text-[var(--muted)]">
        {calendar.totalContributions.toLocaleString()} contributions in the last year
      </div>
    </div>
  );
}
