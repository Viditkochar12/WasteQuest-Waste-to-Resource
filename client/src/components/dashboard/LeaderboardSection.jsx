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
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div className="chip" style={{ marginBottom: "0.75rem" }}>
            EcoRank Leaderboard
          </div>
          <h2 id="leaderboard-title">Top Sustainability Champions</h2>
          <p style={{ marginInline: "auto" }}>
            Recognizing citizens and teams recovering the highest volume of recyclables and diverting municipal waste.
          </p>
        </div>

        {/* Content Box */}
        <div style={{ maxWidth: "760px", marginInline: "auto" }}>
          {/* Loading Skeleton */}
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
                background: "var(--panel-sim)",
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
                  background: "rgba(62, 240, 192, 0.12)",
                  color: "var(--accent)",
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
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--ink)" }}>Leaderboard not available yet</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--mute)", maxWidth: "440px", margin: "0 auto 1.5rem" }}>
                The backend route <code>GET /api/leaderboard</code> is currently under development by Vidit. Real community rankings will populate automatically once the endpoint is live.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRefresh}
                style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.35rem 0.95rem" }}
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
                background: "var(--panel-sim)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden"
              }}
            >
              {leaderboard.map((user, index) => {
                const rank = user.rank || index + 1;
                const rankColor =
                  rank === 1 ? "var(--accent)" : rank === 2 ? "var(--lit-recyclable)" : rank === 3 ? "#fbbf24" : "var(--mute)";

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
                      backgroundColor: rank === 1 ? "rgba(62, 240, 192, 0.04)" : "transparent"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span
                        style={{
                          width: "32px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: rankColor
                        }}
                      >
                        #{rank}
                      </span>
                      <div>
                        <strong style={{ display: "block", color: "var(--ink)" }}>
                          {user.name || user.username || `Recycler_${rank}`}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--mute)" }}>
                          {user.badge || (user.itemsCount ? `${user.itemsCount} items sorted` : "Active Contributor")}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "var(--accent)"
                        }}
                      >
                        {user.points || user.ecoPoints || 0}
                      </span>
                      <span style={{ display: "block", fontSize: "0.6875rem", color: "var(--mute)", textTransform: "uppercase" }}>
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
