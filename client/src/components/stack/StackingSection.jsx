import { useStackScroll } from "../../hooks/useStackScroll";
import { PipelineSim } from "./PipelineSim";

const STREAM_CARDS = [
  {
    id: "organic",
    tag: "Organic stream",
    heading: "Compost and soil regeneration",
    description: "Food scraps, yard trimmings, and organic matter decompose aerobically to enrich agricultural soil rather than generating landfill methane.",
    facts: [
      "Microbial breakdown reaches 55°C to eliminate pathogens",
      "Creates nutrient-rich humus within 60 to 90 days",
      "Eliminates toxic leachate from landfill disposal"
    ],
    bg: "var(--card-organic)",
    litColor: "var(--lit-organic)",
    stages: ["Collect", "Shred", "Compost", "Soil"],
    inputToken: "🍌",
    outputToken: "🌱",
    caption: "Simulation: a banana peel travels through the compost yard and ends as plant-ready soil."
  },
  {
    id: "recyclable",
    tag: "Dry recyclables",
    heading: "Optical sorting and closed-loop remanufacturing",
    description: "Clean polymers and metals undergo high-speed infrared sorting, decontamination washing, and extrusion into high-purity industrial pellets.",
    facts: [
      "Optical near-infrared cameras identify resin types in 10ms",
      "Shredded flakes are washed at 85°C to strip glues",
      "Repolymerized pellets replace virgin petroleum feedstock"
    ],
    bg: "var(--card-recyclable)",
    litColor: "var(--lit-recyclable)",
    stages: ["Sort", "Clean", "Process", "Remanufacture"],
    inputToken: "🧴",
    outputToken: "👕",
    caption: "Simulation: a plastic bottle is sorted, washed, flaked, and spun into recycled fabric."
  },
  {
    id: "hazardous",
    tag: "Hazardous & e-waste",
    heading: "Chemical neutralization and safe recovery",
    description: "Batteries, mercury electronics, and toxic solvents are quarantined to recover precious heavy metals and prevent water contamination.",
    facts: [
      "Pyro-metallurgical furnaces capture cobalt, lithium & nickel",
      "Heavy metals are hermetically sealed from water tables",
      "Prevents persistent toxins from municipal incinerators"
    ],
    bg: "var(--card-hazardous)",
    litColor: "var(--lit-hazardous)",
    stages: ["Isolate", "Identify", "Treat", "Secure disposal"],
    inputToken: "🔋",
    outputToken: "🛡️",
    caption: "Simulation: a household battery is intercepted, neutralized, and prevented from entering groundwater."
  },
  {
    id: "scan",
    tag: "AI intake scanner",
    heading: "Identify materials in real-time",
    description: "Our deep learning vision model identifies packaging types, flags contaminants, and routes your item into the verified municipal pipeline.",
    facts: [
      "Instant multi-stream resin identification",
      "Direct municipal bin assignment to prevent contamination",
      "Verified circular metrics logged to your dashboard"
    ],
    bg: "var(--card-scan)",
    litColor: "var(--lit-scan)",
    isScanCard: true,
    caption: "Simulation: optical scanning classifies resin boundaries and guides correct bin placement."
  }
];

export function StackingSection() {
  const { containerRef, activeCardIndex } = useStackScroll(STREAM_CARDS.length);

  return (
    <section id="streams" className="section-wrapper" aria-labelledby="streams-heading" style={{ overflow: "visible" }}>
      <div className="container" style={{ overflow: "visible" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <div className="chip" style={{ marginBottom: "1rem" }}>
            Circular Transformation
          </div>
          <h2 id="streams-heading">How Every Stream Recovers Value</h2>
          <p style={{ marginInline: "auto" }}>
            Scroll to follow each material pipeline from collection to high-grade industrial remanufacturing.
          </p>
        </div>

        {/* Stacking Cards List */}
        <div
          ref={containerRef}
          className="stack-container"
          style={{
            position: "relative",
            maxWidth: "920px",
            marginInline: "auto",
            overflow: "visible"
          }}
        >
          {STREAM_CARDS.map((card, index) => {
            const isActive = index === activeCardIndex;

            return (
              <article
                key={card.id}
                className={`stack-card ${isActive ? "in" : ""}`}
                style={{
                  "--i": index,
                  position: "sticky",
                  top: `calc(72px + ${index * 12}px)`,
                  zIndex: 10 + index,
                  marginBottom: "14vh",
                  background: card.bg,
                  borderRadius: "var(--radius-lg)",
                  padding: "clamp(1.5rem, 4vw, 2.5rem)",
                  color: "var(--ink)",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.45)",
                  transformOrigin: "top center",
                  willChange: "transform, opacity",
                  minHeight: "min(60vh, 520px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden"
                }}
              >
                {/* Covered Card Dark Overlay */}
                <div
                  className="stack-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--bg)",
                    opacity: "var(--overlay-opacity, 0)",
                    pointerEvents: "none",
                    zIndex: 20,
                    transition: "opacity 80ms linear"
                  }}
                  aria-hidden="true"
                />

                {/* Card Top Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <span className="chip" style={{ background: "var(--card-chip-bg)", color: "var(--card-ink)" }}>
                      {card.tag}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--card-ink)", opacity: 0.8 }}>
                      0{index + 1} / 04
                    </span>
                  </div>

                  <h3 style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", marginBottom: "0.75rem", color: "var(--card-ink)" }}>
                    {card.heading}
                  </h3>

                  <p style={{ color: "var(--card-ink)", opacity: 0.9, fontSize: "1rem", lineHeight: 1.5, margin: 0 }}>
                    {card.description}
                  </p>

                  {/* Facts list (hidden on small screens) */}
                  <ul
                    className="card-facts"
                    style={{
                      listStyle: "none",
                      padding: 0,
                      marginTop: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      fontSize: "0.875rem",
                      color: "var(--card-ink)",
                      opacity: 0.85
                    }}
                  >
                    {card.facts.map((fact) => (
                      <li key={fact} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: card.litColor, fontWeight: 700 }}>✓</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Bottom: Pipeline or Scan Demo */}
                <div style={{ marginTop: "1.25rem" }}>
                  {card.isScanCard ? (
                    /* Scan CTA Interactive Panel */
                    <div
                      style={{
                        background: "var(--panel-sim)",
                        borderRadius: "var(--radius-md)",
                        padding: "clamp(1.25rem, 3vw, 1.75rem)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1.5rem"
                      }}
                    >
                      {/* Scanner Visual Box */}
                      <div
                        style={{
                          position: "relative",
                          width: "140px",
                          height: "90px",
                          background: "var(--scan-box)",
                          borderRadius: "var(--radius-sm)",
                          border: "1.5px solid var(--accent)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem"
                        }}
                        aria-hidden="true"
                      >
                        📦
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            height: "2px",
                            background: "var(--accent)",
                            boxShadow: "0 0 12px 3px var(--accent)",
                            animation: "scanLine 2s infinite ease-in-out alternate"
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <strong style={{ display: "block", color: "var(--ink)", fontSize: "1.1rem", marginBottom: "0.35rem" }}>
                          Ready to route your item?
                        </strong>
                        <p style={{ fontSize: "0.875rem", color: "var(--mute)", margin: 0 }}>
                          Scan packaging with your camera to trigger instant classification.
                        </p>
                      </div>

                      <a href="#scan-workspace" className="btn btn-primary" style={{ paddingInline: "2rem" }}>
                        Scan waste
                      </a>
                    </div>
                  ) : (
                    <PipelineSim
                      stages={card.stages}
                      inputToken={card.inputToken}
                      outputToken={card.outputToken}
                      litColor={card.litColor}
                      isActive={isActive}
                      caption={card.caption}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stack-card {
            top: calc(64px + var(--i) * 9px) !important;
            min-height: auto !important;
            padding: 1.25rem !important;
          }
          .card-facts {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
