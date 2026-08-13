export type BarRow = { label: string; value: number };

export function BarList({ title, rows, hint }: { title: string; rows: BarRow[]; hint?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="viz-card viz">
      <div className="viz-card-title">{title}</div>
      {hint && <div className="viz-card-hint">{hint}</div>}

      {rows.length === 0 ? (
        <p className="viz-empty">No data for this range yet.</p>
      ) : (
        <div style={{ marginTop: 10 }}>
          {rows.map((row) => {
            const pct = Math.max(4, (row.value / max) * 100);
            return (
              <div key={row.label} className="viz-bar-row">
                <span className="viz-bar-label" title={row.label}>
                  {row.label}
                </span>
                <div className="viz-bar-track">
                  <div className="viz-bar-fill" style={{ width: `${pct}%` }}>
                    <span className="viz-bar-value">{row.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
