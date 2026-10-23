import { useState, useEffect } from "react";
import { getLeaderboard } from "../../services/api";
import { Skeleton, ErrorState, EmptyState } from "../common/FeedbackStates";

export default function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEndpointMissing, setIsEndpointMissing] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getLeaderboard({ signal: controller.signal })
      .then((res) => {
        if (ignore) return;
        if (res.ok) {
          setLeaderboard(Array.isArray(res.data) ? res.data : []);
          setError(null);
          setIsEndpointMissing(false);
        } else {
          if (res.error?.code === "ROUTE_NOT_FOUND" || res.error?.status === 404) {
            setIsEndpointMissing(true);
          } else {
            setError(res.error?.message || "Failed to load leaderboard rankings.");
          }
          setLeaderboard(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message || "Failed to load leaderboard.");
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

  return (
    <section id="leaderboard" className="section-wrapper" aria-labelledby="leaderboard-title">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            EcoRank Leaderboard
          </div>
          <h2 id="leaderboard-title">Top Sustainability Champions</h2>
          <p>
            Recognizing citizens and teams recovering the highest volume of recyclables and diverting municipal waste.
          </p>
        </div>

        {/* Content Box */}
        <div style={{ maxWidth: "760px", marginInline: "auto" }}>
          {/* Loading state skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
            </div>
          )}

          {/* Endpoint Not Implemented Yet State (Honest Backend Reporting) */}
          {!loading && isEndpointMissing && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "2.5rem 1.5rem",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "rgba(56, 189, 248, 0.12)",
                  color: "#38bdf8",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem"
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Leaderboard not available yet</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                The backend route <code>GET /api/leaderboard</code> is currently under development by Vidit. Real community rankings will populate automatically once the endpoint is live.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRefresh}
                style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.375rem 0.875rem" }}
              >
                Check again
              </button>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <ErrorState
              title="Unable to connect to Leaderboard"
              message={error}
              onRetry={handleRefresh}
            />
          )}

          {/* Empty State */}
          {!loading && !error && !isEndpointMissing && (!leaderboard || leaderboard.length === 0) && (
            <EmptyState
              title="No rankings recorded yet"
              message="Be the first recycler to join the community leaderboard! Log your waste sorting activities to claim rank #1."
              action={
                <a href="#scan-workspace" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
                  Scan waste to join
                </a>
              }
            />
          )}

          {/* Active Leaderboard Table */}
          {!loading && !error && !isEndpointMissing && leaderboard && leaderboard.length > 0 && (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden"
              }}
            >
              {leaderboard.map((user, index) => {
                const rank = user.rank || index + 1;
                const rankColor =
                  rank === 1 ? "#fbbf24" : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "var(--text-muted)";

                return (
                  <div
                    key={user._id || user.name || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.5rem",
                      borderBottom:
                        index < leaderboard.length - 1 ? "1px solid var(--border-subtle)" : "none",
                      backgroundColor: rank === 1 ? "rgba(251, 191, 36, 0.04)" : "transparent"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span
                        style={{
                          width: "32px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          fontSize: "1.125rem",
                          color: rankColor
                        }}
                      >
                        #{rank}
                      </span>
                      <div>
                        <strong style={{ display: "block", color: "var(--text-primary)" }}>
                          {user.name || user.username || `Recycler_${rank}`}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {user.badge || (user.itemsCount ? `${user.itemsCount} items sorted` : "Active Contributor")}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          color: "var(--brand-primary)"
                        }}
                      >
                        {user.points || user.ecoPoints || 0}
                      </span>
                      <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        EcoPoints
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
