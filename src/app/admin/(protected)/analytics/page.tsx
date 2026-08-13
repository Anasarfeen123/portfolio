import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  AnalyticsNotConfiguredError,
  dateDaysAgo,
  getVisitsAggregate,
  getVisitsCount,
  todayISO,
  type VisitsAggregateRow,
} from "@/lib/vercel-analytics";
import { blogPosts } from "@/data/blog";
import { TrendChart, type TrendPoint } from "@/components/admin/analytics/TrendChart";
import { BarList, type BarRow } from "@/components/admin/analytics/BarList";

export const metadata: Metadata = { title: "Admin — Analytics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function rowsToBars(rows: VisitsAggregateRow[], key: string, limit = 8): BarRow[] {
  return rows
    .map((r) => ({ label: String(r[key] ?? "(unknown)"), value: r.pageviews }))
    .filter((r) => r.label && r.label !== "(unknown)")
    .slice(0, limit);
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = range === "30" ? 30 : 7;
  const since = dateDaysAgo(days);
  const until = todayISO();

  let total: { pageviews: number; visitors: number };
  let daily: TrendPoint[];
  let topPages: BarRow[];
  let topReferrers: BarRow[];
  let topCountries: BarRow[];
  let topDevices: BarRow[];
  let postRows: { slug: string; title: string; pageviews: number }[];

  try {
    const [totalCount, dailyRows, pageRows, referrerRows, countryRows, deviceRows, postCounts] = await Promise.all([
      getVisitsCount(),
      getVisitsAggregate({ since, until, by: "day" }),
      getVisitsAggregate({ since, until, by: "requestPath", limit: 8 }),
      getVisitsAggregate({ since, until, by: "referrerHostname", limit: 8 }),
      getVisitsAggregate({ since, until, by: "country", limit: 8 }),
      getVisitsAggregate({ since, until, by: "deviceType", limit: 8 }),
      Promise.all(
        blogPosts.map(async (p) => ({
          slug: p.slug,
          title: p.title,
          ...(await getVisitsCount(`requestPath eq '/blog/${p.slug}'`)),
        }))
      ),
    ]);

    total = totalCount;
    daily = dailyRows.map((r) => ({
      date: (r.timestamp ?? "").slice(0, 10),
      pageviews: r.pageviews,
      visitors: r.visitors,
    }));
    topPages = rowsToBars(pageRows, "requestPath");
    topReferrers = rowsToBars(referrerRows, "referrerHostname").map((r) => ({ ...r, label: r.label || "Direct / none" }));
    topCountries = rowsToBars(countryRows, "country");
    topDevices = rowsToBars(deviceRows, "deviceType");
    postRows = postCounts.sort((a, b) => b.pageviews - a.pageviews);
  } catch (err) {
    if (err instanceof AnalyticsNotConfiguredError) {
      return (
        <div className="admin-page-inner">
          <div className="admin-page-header">
            <div>
              <div className="kicker">Admin</div>
              <h1 className="admin-page-title">Analytics</h1>
            </div>
          </div>
          <div className="viz-card" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={16} className="text-[var(--signal)]" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: "var(--heading)", fontSize: 13, fontWeight: 600 }}>Analytics isn&apos;t configured yet.</p>
              <p className="admin-field-hint" style={{ marginTop: 4 }}>
                Set <code>VERCEL_API_TOKEN</code> and <code>VERCEL_PROJECT_ID</code> (and <code>VERCEL_TEAM_ID</code> if
                this project is under a team, not your personal account) — see <code>.env.example</code> for how to get
                them.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  return (
    <div className="admin-page-inner">
      <div className="admin-page-header">
        <div>
          <div className="kicker">Admin</div>
          <h1 className="admin-page-title">Analytics</h1>
        </div>
        <div className="filter-pills">
          <Link href="/admin/analytics?range=7" className={`filter-pill ${days === 7 ? "filter-pill-active" : ""}`}>
            7 days
          </Link>
          <Link href="/admin/analytics?range=30" className={`filter-pill ${days === 30 ? "filter-pill-active" : ""}`}>
            30 days
          </Link>
        </div>
      </div>
      <p className="admin-field-hint" style={{ marginBottom: 20 }}>
        Free-plan Vercel Web Analytics keeps a 1-month reporting window — ranges beyond that won&apos;t have data.
      </p>

      <div className="viz-stat-grid">
        <div className="viz-card viz">
          <div className="viz-stat-value">{total.pageviews.toLocaleString()}</div>
          <div className="viz-stat-label">Pageviews</div>
        </div>
        <div className="viz-card viz">
          <div className="viz-stat-value">{total.visitors.toLocaleString()}</div>
          <div className="viz-stat-label">Visitors</div>
        </div>
        <div className="viz-card viz">
          <div className="viz-stat-value">{postRows.reduce((sum, p) => sum + p.pageviews, 0).toLocaleString()}</div>
          <div className="viz-stat-label">Blog pageviews</div>
        </div>
        <div className="viz-card viz">
          <div className="viz-stat-value">{days}d</div>
          <div className="viz-stat-label">Range</div>
        </div>
      </div>

      <TrendChart data={daily} />

      <div className="admin-editor-grid-2" style={{ marginTop: 12 }}>
        <BarList title="Top pages" rows={topPages} />
        <BarList title="Referrers" rows={topReferrers} />
        <BarList title="Countries" rows={topCountries} />
        <BarList title="Devices" rows={topDevices} />
      </div>

      <div className="viz-card viz" style={{ marginTop: 12 }}>
        <div className="viz-card-title">Blog post pageviews</div>
        {postRows.length === 0 ? (
          <p className="viz-empty">No posts yet.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table className="viz-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Pageviews</th>
                </tr>
              </thead>
              <tbody>
                {postRows.map((p) => (
                  <tr key={p.slug}>
                    <td>{p.title}</td>
                    <td>{p.pageviews.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
