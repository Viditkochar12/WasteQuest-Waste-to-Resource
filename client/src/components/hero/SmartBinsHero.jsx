import { useState, useEffect } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useInView } from "../../hooks/useInView";

const BINS_DATA = [
  {
    id: "organic",
    name: "Organic",
    color: "var(--bin-organic)",
    icon: "🍏",
    items: [
      { id: "org-1", label: "Apple core", icon: "🍎", delay: "0s" },
      { id: "org-2", label: "Banana peel", icon: "🍌", delay: "2.4s" }
    ]
  },
  {
    id: "recyclable",
    name: "Recyclable",
    color: "var(--bin-recyclable)",
    icon: "♻️",
    items: [
      { id: "rec-1", label: "Plastic bottle", icon: "🧴", delay: "0.8s" },
      { id: "rec-2", label: "Soda can", icon: "🥫", delay: "3.2s" }
    ]
  },
  {
    id: "hazardous",
    name: "Hazardous",
    color: "var(--bin-hazardous)",
    icon: "⚠️",
    items: [
      { id: "haz-1", label: "Lithium battery", icon: "🔋", delay: "1.6s" },
      { id: "haz-2", label: "Light bulb", icon: "💡", delay: "4.0s" }
    ]
  }
];

export function SmartBinsHero() {
  const prefersReducedMotion = useReducedMotion();
  const [containerRef, isInView] = useInView({ threshold: 0.1 });
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const shouldAnimate = isInView && !isTabHidden && !prefersReducedMotion;

  return (
    <section
      ref={containerRef}
      className="section-wrapper"
      aria-labelledby="hero-headline"
      style={{
        paddingTop: "clamp(3rem, 6vw, 5.5rem)",
        paddingBottom: "clamp(4rem, 7vw, 6rem)",
        position: "relative"
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "clamp(2.5rem, 5vw, 4rem)",
            alignItems: "center"
          }}
        >
          {/* Left Column: Headline and Call-to-Actions */}
          <div>
            <div className="chip" style={{ marginBottom: "1.25rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 10px var(--accent)"
                }}
              />
              Waste-to-Resource Sorter
            </div>

            <h1 id="hero-headline" style={{ marginBottom: "1.25rem" }}>
              Every item has a next life.
            </h1>

            <p
              style={{
                fontSize: "clamp(1.0625rem, 1.5vw, 1.25rem)",
                lineHeight: 1.6,
                color: "var(--mute)",
                marginBottom: "2rem"
              }}
            >
              Take a photo of any discarded object. Our neural classifier maps it to the right waste stream,
              uncovers its downstream recovery journey, and keeps recyclable resources out of landfills.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              <a href="#scan-workspace" className="btn btn-primary">
                Scan waste
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <a href="#streams" className="btn btn-secondary">
                Explore streams
              </a>
            </div>
          </div>

          {/* Right Column: Three Bins Simulation Visual Stage */}
          <div
            style={{
              background: "var(--panel-sim)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "clamp(1.5rem, 3.5vw, 2.5rem)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
              position: "relative"
            }}
            aria-label="Simulation of waste items falling into Organic, Recyclable, and Hazardous bins"
          >
            {/* Visual Bins Container */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "clamp(0.75rem, 2vw, 1.25rem)",
                height: "300px",
                alignItems: "flex-end",
                position: "relative"
              }}
            >
              {BINS_DATA.map((bin) => (
                <div
                  key={bin.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    height: "100%",
                    justifyContent: "flex-end"
                  }}
                >
                  {/* Dropping Items Container */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: "120px",
                      width: "100%",
                      pointerEvents: "none",
                      overflow: "hidden"
                    }}
                    aria-hidden="true"
                  >
                    {bin.items.map((item) => (
                      <div
                        key={item.id}
                        className="falling-token"
                        style={{
                          position: "absolute",
                          left: "50%",
                          fontSize: "2rem",
                          transform: "translateX(-50%)",
                          animation: shouldAnimate
                            ? `dropIntoBin 4.8s infinite ease-in ${item.delay}`
                            : "none",
                          opacity: prefersReducedMotion ? 0.9 : 0
                        }}
                        title={item.label}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </div>

                  {/* Bin Body (Inline SVG with exact Midnight colors) */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "110px",
                      position: "relative",
                      zIndex: 10
                    }}
                  >
                    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${bin.name} bin`}>
                      {/* Bin Lid / Rim */}
                      <rect x="5" y="10" width="90" height="12" rx="4" fill={bin.color} />
                      <rect x="35" y="4" width="30" height="6" rx="3" fill={bin.color} />

                      {/* Bin Vessel */}
                      <path d="M12 22 L20 114 C21 118 25 120 29 120 H71 C75 120 79 118 80 114 L88 22 Z" fill={bin.color} />

                      {/* Dark Label Plate */}
                      <rect x="22" y="45" width="56" height="24" rx="4" fill="var(--bin-label)" />
                      <text
                        x="50"
                        y="61"
                        textAnchor="middle"
                        fill={bin.color}
                        fontFamily="var(--font-heading)"
                        fontWeight="700"
                        fontSize="10"
                        letterSpacing="0.04em"
                      >
                        {bin.name.toUpperCase()}
                      </text>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Mandatory Visible Caption */}
            <div className="caption-box" style={{ marginTop: "1.5rem" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <strong>Demo animation:</strong> items drop into the matching bin. Real classification happens when you scan a photo.
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropIntoBin {
          0% {
            transform: translate3d(-50%, -40px, 0) scale(0.7);
            opacity: 0;
          }
          20% {
            transform: translate3d(-50%, 20px, 0) scale(1);
            opacity: 1;
          }
          70% {
            transform: translate3d(-50%, 120px, 0) scale(1);
            opacity: 1;
          }
          85% {
            transform: translate3d(-50%, 150px, 0) scale(0.65);
            opacity: 0.3;
          }
          100% {
            transform: translate3d(-50%, 160px, 0) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
