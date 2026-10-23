import { useState, useEffect } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useInView } from "../../hooks/useInView";

const BELT_ITEMS = [
  { id: 1, name: "Soda Can", icon: "🥫", targetBin: "metal", label: "Aluminum" },
  { id: 2, name: "Water Bottle", icon: "🧴", targetBin: "plastic", label: "PET Plastic" },
  { id: 3, name: "Newspaper", icon: "📄", targetBin: "paper", label: "Clean Paper" },
  { id: 4, name: "Glass Bottle", icon: "🍾", targetBin: "glass", label: "Cullet Glass" },
  { id: 5, name: "Plastic Wrap", icon: "🛍️", targetBin: "other", label: "Residual" },
  { id: 6, name: "Food Tin", icon: "🥫", targetBin: "metal", label: "Steel Tin" },
  { id: 7, name: "Cardboard", icon: "📦", targetBin: "paper", label: "Corrugated" },
  { id: 8, name: "Milk Jug", icon: "🥛", targetBin: "plastic", label: "HDPE" }
];

const BINS = [
  { id: "plastic", name: "Plastic", color: "var(--cat-plastic)", symbol: "🧴" },
  { id: "paper", name: "Paper / Cardboard", color: "var(--cat-paper)", symbol: "📄" },
  { id: "metal", name: "Metal", color: "var(--cat-metal)", symbol: "🥫" },
  { id: "glass", name: "Glass", color: "var(--cat-glass)", symbol: "🍾" },
  { id: "other", name: "Other / Residual", color: "var(--cat-general)", symbol: "🗑️" }
];

export function SortingBelt() {
  const prefersReducedMotion = useReducedMotion();
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const [userPaused, setUserPaused] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  // Auto-pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const isPlaying = isInView && !prefersReducedMotion && !userPaused && !isTabHidden;

  return (
    <section
      id="sorting-belt"
      ref={sectionRef}
      className="section-wrapper"
      aria-labelledby="belt-heading"
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="section-header text-center">
          <div className="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="7" width="20" height="10" rx="2" />
              <line x1="6" y1="17" x2="6" y2="21" />
              <line x1="18" y1="17" x2="18" y2="21" />
            </svg>
            Automated Segregation
          </div>
          <h2 id="belt-heading">Optical Conveyor Sorting</h2>
          <p>
            Simulating industrial MRF (Material Recovery Facility) optical scanners routing discrete waste streams into
            specialized processing silos.
          </p>
        </div>

        {/* Visual Belt Stage */}
        <div
          style={{
            maxWidth: "960px",
            marginInline: "auto",
            background: "#08100b",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            padding: "2rem 1.5rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-elevated)"
          }}
          aria-label="Simulation of conveyor belt sorting items into bins"
        >
          {/* Top Controls: Play/Pause toggle button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isPlaying ? "var(--brand-primary)" : "var(--status-warning)",
                  boxShadow: isPlaying ? "0 0 10px var(--brand-primary)" : "none"
                }}
              />
              <span style={{ fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                Conveyor Status: {isPlaying ? "Running" : "Paused"}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setUserPaused(!userPaused)}
              style={{ fontSize: "0.8125rem", minHeight: "36px", padding: "0.375rem 0.875rem" }}
              aria-label={isPlaying ? "Pause sorting conveyor belt" : "Start sorting conveyor belt"}
            >
              {isPlaying ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Pause belt
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Resume belt
                </>
              )}
            </button>
          </div>

          {/* Scanner Beam Gantry */}
          <div
            style={{
              position: "relative",
              height: "110px",
              background: "#0d1a12",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-medium)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center"
            }}
          >
            {/* Overhead Optical Scanner Sensor */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "90px",
                height: "16px",
                background: "var(--bg-surface-elevated)",
                borderBottom: "2px solid var(--brand-primary)",
                borderRadius: "0 0 6px 6px",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: isPlaying ? "var(--brand-primary)" : "var(--status-danger)",
                  boxShadow: isPlaying ? "0 0 8px var(--brand-primary)" : "none"
                }}
              />
            </div>

            {/* Downward scanning laser beam */}
            {isPlaying && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "16px",
                  bottom: 0,
                  width: "60px",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(180deg, rgba(16, 185, 129, 0.45) 0%, rgba(16, 185, 129, 0.02) 100%)",
                  pointerEvents: "none",
                  zIndex: 8,
                  clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)"
                }}
              />
            )}

            {/* Looping Track of Waste Items */}
            <div
              style={{
                display: "flex",
                gap: "3rem",
                width: "max-content",
                animation: isPlaying ? "conveyorScroll 14s linear infinite" : "none",
                willChange: "transform"
              }}
            >
              {[...BELT_ITEMS, ...BELT_ITEMS].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 1rem",
                    background: "rgba(18, 31, 24, 0.6)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span style={{ fontSize: "0.6875rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Labelled Drop Bins Below Belt */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.75rem",
              marginTop: "2rem"
            }}
          >
            {BINS.map((bin) => (
              <div
                key={bin.id}
                style={{
                  background: "var(--bg-surface-elevated)",
                  border: `1.5px solid ${bin.color}`,
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 0.75rem",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{bin.symbol}</div>
                <strong style={{ display: "block", fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  {bin.name}
                </strong>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.6875rem",
                    fontFamily: "var(--font-mono)",
                    color: bin.color,
                    marginTop: "0.25rem"
                  }}
                >
                  Automated Drop
                </span>
              </div>
            ))}
          </div>

          {/* Mandatory Accessible Caption */}
          <div className="section-caption" style={{ marginTop: "1.75rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Illustrative simulation of how sorting works.</strong> Not live data.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes conveyorScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </section>
  );
}
