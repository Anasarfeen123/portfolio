import { NextResponse } from "next/server";
import { profile } from "@/data/portfolio";

// Public route (no admin auth — this serves public GitHub profile data to
// the public homepage), but the GraphQL contributionsCollection field still
// needs a token server-side (read:user scope on a classic PAT — confirmed
// via GitHub's docs; fine-grained PATs don't map cleanly to this field).
// GITHUB_STATS_TOKEN is deliberately its own, separately-scoped credential —
// not GITHUB_CONTENT_TOKEN, which is repo-write and the wrong tool for
// read-only public profile data.
export const revalidate = 3600; // 1 hour — this data doesn't need to be fresher than that

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  const token = process.env.GITHUB_STATS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: profile.handle } }),
      next: { revalidate },
    });

    if (!res.ok) throw new Error(`GitHub GraphQL failed: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error("Unexpected response shape");

    return NextResponse.json(calendar);
  } catch (err) {
    console.error("github-contributions: fetch failed", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
