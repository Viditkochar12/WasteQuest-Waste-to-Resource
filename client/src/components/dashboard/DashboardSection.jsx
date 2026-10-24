import { useState, useEffect } from "react";
import { getReports } from "../../services/api";
import { getReportImageUrl } from "../../services/reportImages";
import { Skeleton, ErrorState, EmptyState } from "../common/FeedbackStates";

function ReportImagePreview({ imageUrl, category, recyclable }) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [failedUrl, setFailedUrl] = useState(null);

  if (imageUrl && failedUrl !== imageUrl) {
    return (
      <div
        style={{
          width: "48px",
          height: "48px",
          flex: "0 0 48px",
          borderRadius: "10px",
          background: recyclable ? "rgba(62, 240, 192, 0.15)" : "rgba(255, 95, 158, 0.15)",
          color: recyclable ? "var(--accent)" : "var(--status-danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <span aria-hidden="true">{recyclable ? "♻️" : "🗑️"}</span>
        <img
          src={imageUrl}
          alt={`${category || "Waste"} report`}
          width="48"
          height="48"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={() => setFailedUrl(imageUrl)}
          style={{
            width: "48px",
            height: "48px",
            position: "absolute",
            inset: 0,
            objectFit: "cover",
            opacity: loadedUrl === imageUrl ? 1 : 0,
            background: "var(--bg)"
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: "48px",
        height: "48px",
        flex: "0 0 48px",
        borderRadius: "10px",
        background: recyclable ? "rgba(62, 240, 192, 0.15)" : "rgba(255, 95, 158, 0.15)",
        color: recyclable ? "var(--accent)" : "var(--status-danger)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2rem"
      }}
    >
      {recyclable ? "♻️" : "🗑️"}
    </div>
  );
}

export default function DashboardSection() {
  const [reports, setReports] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getReports({ page, limit: 10, signal: controller.signal })
      .then((res) => {
        if (ignore) return;
        if (res.ok) {
          setReports(Array.isArray(res.data) ? res.data : []);
          setPagination(res.pagination || null);
          setError(null);
        } else {
          setError(res.error?.message || "Failed to load recent reports from backend.");
          setReports(null);
          setPagination(null);
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
  }, [page, reloadTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setReloadTrigger((count) => count + 1);
  };

  // Compute live statistics only if real data is available
  const hasRealData = Array.isArray(reports) && reports.length > 0;
  const totalScans = pagination?.totalReports !== undefined ? pagination.totalReports : (hasRealData ? reports.length : null);
  const totalRecyclables = hasRealData ? reports.filter((r) => r.recyclable).length : null;
  const estimatedPoints = hasRealData ? totalRecyclables * 25 + (reports.length - totalRecyclables) * 5 : null;

  return (
    <section id="dashboard" className="section-wrapper" aria-labelledby="dashboard-title">
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="chip" style={{ marginBottom: "0.75rem" }}>
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
              background: "var(--panel-sim)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Items Scanned
            </span>
            <div style={{ fontSize: "2.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: "0.5rem 0", color: "var(--accent)" }}>
              {loading ? (
                <Skeleton width="80px" height="42px" />
              ) : hasRealData ? (
                totalScans
              ) : (
                <span title="No reports recorded in backend yet">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--mute)", margin: 0 }}>
              {hasRealData ? "Confirmed community entries" : "No reports recorded yet"}
            </p>
          </div>

          {/* Card 2: Diverted from Landfill */}
          <div
            style={{
              background: "var(--panel-sim)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recyclables Diverted
            </span>
            <div style={{ fontSize: "2.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: "0.5rem 0", color: "var(--lit-recyclable)" }}>
              {loading ? (
                <Skeleton width="80px" height="42px" />
              ) : hasRealData ? (
                totalRecyclables
              ) : (
                <span title="Awaiting community data">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--mute)", margin: 0 }}>
              {hasRealData ? "Recovered for feedstock" : "Awaiting community data"}
            </p>
          </div>

          {/* Card 3: EcoPoints Generated */}
          <div
            style={{
              background: "var(--panel-sim)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              EcoPoints Awarded
            </span>
            <div style={{ fontSize: "2.5rem", fontFamily: "var(--font-heading)", fontWeight: 800, margin: "0.5rem 0", color: "#fbbf24" }}>
              {loading ? (
                <Skeleton width="80px" height="42px" />
              ) : hasRealData ? (
                estimatedPoints
              ) : (
                <span title="Generated from real reports">—</span>
              )}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--mute)", margin: 0 }}>
              {hasRealData ? "Earned through verified sorting" : "Generated from live scans"}
            </p>
          </div>
        </div>

        {/* Recent Reports List */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <h3 style={{ fontSize: "1.35rem", margin: 0 }}>Recent Scan Reports</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={loading}
              style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.35rem 0.95rem" }}
            >
              {loading ? "Refreshing..." : "Refresh log"}
            </button>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton height="68px" borderRadius="var(--radius-md)" />
              <Skeleton height="68px" borderRadius="var(--radius-md)" />
              <Skeleton height="68px" borderRadius="var(--radius-md)" />
            </div>
          )}

          {/* Error State with Retry */}
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

          {/* Reports Log */}
          {!loading && !error && reports && reports.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {reports.map((rep, idx) => {
                const imageUrl = getReportImageUrl(rep.image?.url);
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
                      background: "var(--panel-sim)",
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
                      <ReportImagePreview
                        imageUrl={imageUrl}
                        category={rep.category}
                        recyclable={rep.recyclable}
                      />
                      <div>
                        <strong style={{ display: "block", textTransform: "capitalize", color: "var(--ink)", fontSize: "1rem" }}>
                          {rep.category || "Uncategorized item"}
                        </strong>
                        <span style={{ fontSize: "0.8125rem", color: "var(--mute)" }}>
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
                            color: "var(--accent)"
                          }}
                        >
                          {Math.round(rep.confidence * 100)}% match
                        </span>
                      )}
                      <span style={{ fontSize: "0.8125rem", color: "var(--mute)", fontFamily: "var(--font-mono)" }}>
                        {dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              {pagination && (pagination.hasPreviousPage || pagination.hasNextPage) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border-subtle)"
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage || loading}
                    style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.35rem 0.85rem" }}
                  >
                    ← Previous page
                  </button>

                  <span style={{ fontSize: "0.8125rem", color: "var(--mute)", fontFamily: "var(--font-mono)" }}>
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.35rem 0.85rem" }}
                  >
                    Next page →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
