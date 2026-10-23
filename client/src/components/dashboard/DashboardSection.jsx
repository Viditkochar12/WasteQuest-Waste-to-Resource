import { useState, useEffect } from "react";
import { getReports } from "../../services/api";
import { Skeleton, ErrorState, EmptyState } from "../common/FeedbackStates";

export default function DashboardSection() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getReports({ signal: controller.signal })
      .then((res) => {
        if (ignore) return;
        if (res.ok) {
          setReports(Array.isArray(res.data) ? res.data : []);
          setError(null);
        } else {
          setError(res.error?.message || "Failed to load recent reports from backend.");
          setReports(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message || "Failed to load reports.");
        setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [reloadTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setReloadTrigger((count) => count + 1);
  };

  // Compute live statistics only if real data is available
  const hasRealData = Array.isArray(reports) && reports.length > 0;
  const totalScans = hasRealData ? reports.length : null;
  const totalRecyclables = hasRealData ? reports.filter((r) => r.recyclable).length : null;
  const diversionRate = hasRealData ? Math.round((totalRecyclables / totalScans) * 100) : null;
  const estimatedPoints = hasRealData ? totalRecyclables * 25 + (totalScans - totalRecyclables) * 5 : null;

  return (
    <section id="dashboard" className="section-wrapper" aria-labelledby="dashboard-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Live Impact Tracker
          </div>
          <h2 id="dashboard-title">Community Circular Metrics</h2>
          <p>
            Real metrics derived directly from verified waste classification reports recorded in the backend.
          </p>
        </div>

        {/* Real Data Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "3rem"
          }}
        >
          {/* Card 1: Total Scans */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Items Scanned
            </span>
            <div style={{ fontSize: "2.25rem", fontFamily: "var(--font-mono)", fontWeight: 700, margin: "0.5rem 0", color: "var(--brand-primary)" }}>
              {loading ? (
                <Skeleton width="80px" height="38px" />
              ) : hasRealData ? (
                totalScans
              ) : (
                <span title="No reports recorded in backend yet">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              {hasRealData ? "Confirmed scan entries" : "No reports recorded yet"}
            </p>
          </div>

          {/* Card 2: Diverted from Landfill */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Recyclables Diverted
            </span>
            <div style={{ fontSize: "2.25rem", fontFamily: "var(--font-mono)", fontWeight: 700, margin: "0.5rem 0", color: "var(--cat-plastic)" }}>
              {loading ? (
                <Skeleton width="80px" height="38px" />
              ) : hasRealData ? (
                totalRecyclables
              ) : (
                <span title="Awaiting community data">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              {hasRealData ? `${diversionRate}% diversion rate` : "Awaiting community data"}
            </p>
          </div>

          {/* Card 3: EcoPoints Generated */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem"
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              EcoPoints Earned
            </span>
            <div style={{ fontSize: "2.25rem", fontFamily: "var(--font-mono)", fontWeight: 700, margin: "0.5rem 0", color: "#fbbf24" }}>
              {loading ? (
                <Skeleton width="80px" height="38px" />
              ) : hasRealData ? (
                estimatedPoints
              ) : (
                <span title="Generated from real reports">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              {hasRealData ? "Awarded for proper sorting" : "Generated from live scans"}
            </p>
          </div>
        </div>

        {/* Recent Reports Log */}
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem"
            }}
          >
            <h3 style={{ fontSize: "1.375rem" }}>Recent Scan Reports</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
              style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.375rem 0.875rem" }}
            >
              {loading ? "Refreshing..." : "Refresh list"}
            </button>
          </div>

          {/* Loading state skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton height="64px" borderRadius="var(--radius-md)" />
              <Skeleton height="64px" borderRadius="var(--radius-md)" />
              <Skeleton height="64px" borderRadius="var(--radius-md)" />
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <ErrorState
              title="Unable to load report log"
              message={error}
              onRetry={handleRefresh}
            />
          )}

          {/* Empty State */}
          {!loading && !error && (!reports || reports.length === 0) && (
            <EmptyState
              title="No reports yet"
              message="No waste classifications have been logged to the database yet. Scan your first item above to start tracking."
              action={
                <a href="#scan-workspace" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
                  Scan your first item
                </a>
              }
            />
          )}

          {/* Real Data Reports List */}
          {!loading && !error && reports && reports.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              {reports.map((rep, idx) => {
                const dateStr = rep.createdAt
                  ? new Date(rep.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "Recently";

                const itemKey = rep._id || (rep.createdAt ? `${rep.createdAt}-${idx}` : `rep-${idx}`);

                return (
                  <div
                    key={itemKey}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: rep.recyclable ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: rep.recyclable ? "var(--status-success)" : "var(--status-danger)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.125rem"
                        }}
                      >
                        {rep.recyclable ? "♻️" : "🗑️"}
                      </div>
                      <div>
                        <strong style={{ display: "block", textTransform: "capitalize", color: "var(--text-primary)" }}>
                          {rep.category || "Uncategorized item"}
                        </strong>
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          {rep.disposalAdvice ? rep.disposalAdvice.slice(0, 75) + "..." : "Logged in database"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      {typeof rep.confidence === "number" && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.8125rem",
                            color: "var(--brand-primary)"
                          }}
                        >
                          {Math.round(rep.confidence * 100)}% match
                        </span>
                      )}
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
