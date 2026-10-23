import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useInView } from "../../hooks/useInView";

const STOPS = [
  {
    id: "scan",
    stepNumber: "01",
    title: "Scan",
    caption: "Scan: a photo is sent to the AI classifier",
    description: "Capture a clear photo of any discarded object using your smartphone or desktop camera.",
    icon: "📸",
    itemLabel: "Plastic Bottle",
    binType: "Intake Station"
  },
  {
    id: "classify",
    stepNumber: "02",
    title: "Classify",
    caption: "Classify: computer vision analyzes material stream",
    description: "Our neural network evaluates visual textures and patterns to identify whether an item is plastic, paper, glass, or metal.",
    icon: "🧠",
    itemLabel: "PET Polymer Detected",
    binType: "Optical Vision"
  },
  {
    id: "route",
    stepNumber: "03",
    title: "Route",
    caption: "Route: the result tells you which bin to use",
    description: "Instant clear instructions guide you to deposit the item in the proper segregated receptacle to avoid contamination.",
    icon: "📍",
    itemLabel: "Blue Recycling Bin",
    binType: "Segregation"
  },
  {
    id: "recover",
    stepNumber: "04",
    title: "Recover",
    caption: "Recover: waste converts to valuable industrial feedstock",
    description: "Material recovery facilities shred, melt, and pelletize pure streams for high-value remanufacturing.",
    icon: "♻️",
    itemLabel: "Recycled Flakes / Pellets",
    binType: "Recovery Facility"
  },
  {
    id: "climb",
    stepNumber: "05",
    title: "Climb",
    caption: "Climb: earn EcoPoints and track your diverted carbon",
    description: "Log your verified classifications into the circular database and compete with other eco-champions on the leaderboard.",
    icon: "🏆",
    itemLabel: "Rank & EcoPoints Earned",
    binType: "Leaderboard"
  }
];

export function RoadJourney() {
  const prefersReducedMotion = useReducedMotion();
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const journeyBoxRef = useRef(null);

  // Allow clicking stops or auto-advancing with scroll
  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;

    const handleScroll = () => {
      if (!journeyBoxRef.current) return;
      const rect = journeyBoxRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress 0 to 1 through the section
      const totalScrollable = rect.height - viewportHeight * 0.4;
      const scrolledPastTop = Math.max(0, -rect.top + 100);
      const progress = Math.min(1, Math.max(0, scrolledPastTop / Math.max(1, totalScrollable)));

      const nextIndex = Math.min(STOPS.length - 1, Math.floor(progress * STOPS.length));
      setActiveStopIndex(nextIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isInView, prefersReducedMotion]);

  const activeStop = STOPS[activeStopIndex];

  return (
    <section
      id="road-journey"
      ref={sectionRef}
      className="section-wrapper"
      aria-labelledby="journey-heading"
      style={{
        background: "linear-gradient(180deg, var(--bg-page) 0%, #0d1a13 50%, var(--bg-page) 100%)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="section-header text-center">
          <div className="section-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            How It Works
          </div>
          <h2 id="journey-heading">The Road to Circular Recovery</h2>
          <p>
            Follow the journey of a discarded item from phone scan to recycled raw material and community EcoPoints.
          </p>
        </div>

        {/* Interactive Sticky Scene Container */}
        <div
          ref={journeyBoxRef}
          style={{
            maxWidth: "960px",
            marginInline: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2rem"
          }}
        >
          {/* Parallax Road Canvas Visual Stage */}
          <div
            style={{
              position: "relative",
              height: "280px",
              background: "#08120b",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden",
              boxShadow: "var(--shadow-elevated)"
            }}
            aria-label="Illustration of sustainability character walking along a circular recovery journey"
          >
            {/* Parallax Layer 1: Distant Hills & Solar Sky */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "140px",
                transform: prefersReducedMotion ? "none" : `translateX(-${activeStopIndex * 4}%)`,
                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              viewBox="0 0 1000 140"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#142e20" />
                  <stop offset="100%" stopColor="#0a1810" />
                </linearGradient>
              </defs>
              <circle cx="850" cy="40" r="28" fill="#10b981" fillOpacity="0.25" />
              <path d="M0,80 Q200,30 450,75 T900,45 Q1050,70 1200,80 L1200,140 L0,140 Z" fill="url(#hillGrad)" />
              <path d="M0,105 Q300,65 600,100 T1200,75 L1200,140 L0,140 Z" fill="#0d2116" />
            </svg>

            {/* Parallax Layer 2: The Winding Road & Milestones */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "#121b15",
                borderTop: "3px solid #10b981"
              }}
            >
              {/* Road markings */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background: "repeating-linear-gradient(90deg, #10b981 0, #10b981 30px, transparent 30px, transparent 60px)",
                  opacity: 0.4,
                  transform: prefersReducedMotion ? "none" : `translateX(-${(activeStopIndex * 60) % 60}px)`,
                  transition: "transform 0.5s ease"
                }}
              />

              {/* Roadside item at current stop */}
              <div
                style={{
                  position: "absolute",
                  left: "72%",
                  bottom: "35px",
                  textAlign: "center",
                  transition: "all 0.4s ease"
                }}
              >
                <div style={{ fontSize: "2rem", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))" }}>
                  {activeStop.icon}
                </div>
                {/* Scan beam on roadside item */}
                {!prefersReducedMotion && (
                  <div
                    style={{
                      width: "48px",
                      height: "3px",
                      background: "var(--brand-primary)",
                      boxShadow: "0 0 12px var(--brand-primary)",
                      margin: "2px auto 0",
                      animation: "pulseGlow 1.2s infinite ease-in-out"
                    }}
                  />
                )}
              </div>

              {/* Character walking with phone/scanner */}
              <div
                style={{
                  position: "absolute",
                  bottom: "30px",
                  left: prefersReducedMotion ? "30%" : `${15 + activeStopIndex * 14}%`,
                  transition: "left 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                {/* Scanner pulse wave from phone */}
                <div
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-20px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "1.5px solid var(--brand-primary)",
                    opacity: 0.7,
                    animation: prefersReducedMotion ? "none" : "pulseExpand 1.5s infinite"
                  }}
                />

                {/* Inline Character SVG */}
                <svg width="44" height="64" viewBox="0 0 44 64" fill="none">
                  {/* Head & Hat */}
                  <circle cx="22" cy="14" r="8" fill="#e2e8f0" />
                  <path d="M12 14 C12 8, 32 8, 32 14 Z" fill="#10b981" />
                  {/* Torso / Jacket */}
                  <path d="M14 24 L30 24 L28 44 L16 44 Z" fill="#1e3428" stroke="#34d399" strokeWidth="1.5" />
                  {/* Hand holding green glowing scanner phone */}
                  <line x1="28" y1="28" x2="38" y2="24" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="36" y="19" width="6" height="10" rx="1.5" fill="#10b981" />
                  {/* Walking legs */}
                  <line x1="18" y1="44" x2="14" y2="58" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                  <line x1="26" y1="44" x2="30" y2="58" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar (Keyboard operable) */}
          <div
            role="tablist"
            aria-label="How it works stops"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${STOPS.length}, 1fr)`,
              gap: "0.5rem"
            }}
          >
            {STOPS.map((stop, index) => {
              const isActive = index === activeStopIndex;
              return (
                <button
                  key={stop.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`stop-panel-${stop.id}`}
                  onClick={() => setActiveStopIndex(index)}
                  style={{
                    background: isActive ? "rgba(16, 185, 129, 0.15)" : "var(--bg-surface)",
                    border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-subtle)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 0.5rem",
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "center",
                    minHeight: "44px",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: isActive ? "var(--brand-primary)" : "var(--text-muted)"
                    }}
                  >
                    {stop.stepNumber}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{stop.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stop Card with Accessible Captions */}
          <div
            id={`stop-panel-${activeStop.id}`}
            role="tabpanel"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-lg)",
              padding: "clamp(1.5rem, 4vw, 2.25rem)",
              boxShadow: "var(--shadow-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  color: "var(--brand-primary)",
                  fontWeight: 700
                }}
              >
                Step {activeStop.stepNumber} of 05
              </span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{activeStop.binType}</span>
            </div>

            <h3 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
              {activeStop.title}: {activeStop.itemLabel}
            </h3>

            <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {activeStop.description}
            </p>

            {/* Explicit visible caption under animation as required */}
            <div className="section-caption" style={{ marginTop: "1.25rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <strong>{activeStop.title}:</strong> {activeStop.caption}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
