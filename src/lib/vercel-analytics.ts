/**
 * Plain-fetch wrapper around Vercel's Web Analytics query API
 * (https://vercel.com/docs/analytics/web-analytics-api). Same style as
 * github-content.ts — no SDK, this is a handful of GET requests.
 *
 * Auth: a Vercel personal access token (VERCEL_API_TOKEN, user-created —
 * separate from every other credential here) plus VERCEL_PROJECT_ID and,
 * only for team-owned projects, VERCEL_TEAM_ID. Fails closed with a clear
 * "not configured" error if these aren't set, same pattern as every other
 * optional integration in this project (Resend, GitHub content token).
 */

const API_BASE = "https://api.vercel.com/v1/query/web-analytics";

export class AnalyticsNotConfiguredError extends Error {
  constructor() {
    super("Analytics isn't configured — set VERCEL_API_TOKEN and VERCEL_PROJECT_ID.");
    this.name = "AnalyticsNotConfiguredError";
  }
}

function requireEnv() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) throw new AnalyticsNotConfiguredError();
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID };
}

async function query<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const { token, projectId, teamId } = requireEnv();
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("projectId", projectId);
  if (teamId) url.searchParams.set("teamId", teamId);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Vercel analytics query failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type VisitsCount = { pageviews: number; visitors: number };
export type VisitsAggregateRow = { timestamp?: string; pageviews: number; visitors: number } & Record<string, unknown>;

export async function getVisitsCount(filter?: string): Promise<VisitsCount> {
  const data = await query<{ data: VisitsCount }>("/visits/count", { filter });
  return data.data;
}

export async function getVisitsAggregate(params: {
  since: string;
  until: string;
  by: "day" | "route" | "requestPath" | "country" | "referrerHostname" | "deviceType" | "browserName";
  limit?: number;
  filter?: string;
}): Promise<VisitsAggregateRow[]> {
  const data = await query<{ data: VisitsAggregateRow[] }>("/visits/aggregate", params);
  return data.data;
}

export function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
