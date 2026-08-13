"use client";

import { useMemo, useRef, useState } from "react";
import { Table2, TrendingUp } from "lucide-react";

export type TrendPoint = { date: string; pageviews: number; visitors: number };

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 24, left: 12 };

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tableView, setTableView] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => Math.max(d.pageviews, d.visitors)));
    return niceMax(max);
  }, [data]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
    return data.map((d, i) => ({
      x: PADDING.left + step * i,
      pageviewsY: PADDING.top + plotHeight * (1 - d.pageviews / maxValue),
      visitorsY: PADDING.top + plotHeight * (1 - d.visitors / maxValue),
      ...d,
    }));
  }, [data, maxValue, plotWidth, plotHeight]);

  const pageviewsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.pageviewsY}`).join(" ");
  const visitorsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.visitorsY}`).join(" ");

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="viz-card viz">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="viz-card-title">Daily traffic</div>
          <div className="viz-legend">
            <span className="viz-legend-item">
              <span className="viz-legend-swatch" style={{ background: "var(--viz-series-1)" }} /> Pageviews
            </span>
            <span className="viz-legend-item">
              <span className="viz-legend-swatch" style={{ background: "var(--viz-series-2)" }} /> Visitors
            </span>
          </div>
        </div>
        <button type="button" onClick={() => setTableView((v) => !v)} className="admin-header-link">
          {tableView ? <TrendingUp size={12} /> : <Table2 size={12} />}
          {tableView ? "Chart" : "Table"}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="viz-empty">No data for this range yet.</p>
      ) : tableView ? (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table className="viz-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pageviews</th>
                <th>Visitors</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{formatDate(d.date)}</td>
                  <td>{d.pageviews.toLocaleString()}</td>
                  <td>{d.visitors.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ position: "relative", marginTop: 12 }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto"
            role="img"
            aria-label="Daily pageviews and visitors trend"
            onPointerMove={handleMove}
            onPointerLeave={() => setHoverIndex(null)}
          >
            {/* Gridlines: 0%, 50%, 100% */}
            {[0, 0.5, 1].map((f) => (
              <line
                key={f}
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={PADDING.top + plotHeight * f}
                y2={PADDING.top + plotHeight * f}
                stroke="var(--viz-grid)"
                strokeWidth={1}
              />
            ))}

            <path d={pageviewsPath} fill="none" stroke="var(--viz-series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={visitorsPath} fill="none" stroke="var(--viz-series-2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            {hovered && (
              <line x1={hovered.x} x2={hovered.x} y1={PADDING.top} y2={PADDING.top + plotHeight} stroke="var(--viz-axis)" strokeWidth={1} />
            )}
            {hovered && (
              <>
                <circle cx={hovered.x} cy={hovered.pageviewsY} r={4} fill="var(--viz-series-1)" stroke="var(--card-bg)" strokeWidth={2} />
                <circle cx={hovered.x} cy={hovered.visitorsY} r={4} fill="var(--viz-series-2)" stroke="var(--card-bg)" strokeWidth={2} />
              </>
            )}

            {/* x-axis end labels only — direct labels stay sparing */}
            <text x={PADDING.left} y={HEIGHT - 6} fontSize={9} fill="var(--muted)">
              {formatDate(data[0].date)}
            </text>
            <text x={WIDTH - PADDING.right} y={HEIGHT - 6} fontSize={9} fill="var(--muted)" textAnchor="end">
              {formatDate(data[data.length - 1].date)}
            </text>
          </svg>

          {hovered && (
            <div
              className="viz-tooltip"
              style={{
                left: `${Math.min(85, Math.max(0, (hovered.x / WIDTH) * 100))}%`,
                top: 0,
              }}
            >
              <div className="viz-tooltip-date">{formatDate(hovered.date)}</div>
              <div className="viz-tooltip-row">
                <span className="viz-tooltip-key" style={{ background: "var(--viz-series-1)" }} />
                <span className="viz-tooltip-value">{hovered.pageviews.toLocaleString()}</span>
                <span className="viz-tooltip-label">pageviews</span>
              </div>
              <div className="viz-tooltip-row">
                <span className="viz-tooltip-key" style={{ background: "var(--viz-series-2)" }} />
                <span className="viz-tooltip-value">{hovered.visitors.toLocaleString()}</span>
                <span className="viz-tooltip-label">visitors</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
