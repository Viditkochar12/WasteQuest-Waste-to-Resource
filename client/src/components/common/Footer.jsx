
export function Footer() {
  return (
    <footer
      style={{
        background: "#070c09",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "4rem",
        paddingBottom: "3rem"
      }}
      role="contentinfo"
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem"
          }}
        >
          {/* Brand & Mission */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--brand-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#062413",
                  fontWeight: 800
                }}
              >
                WQ
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem" }}>
                Waste<span style={{ color: "var(--brand-primary)" }}>Quest</span>
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Accelerating circular economy transitions through computer vision waste classification, verifiable
              recovery data, and community engagement.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <li>
                <a href="#scan-workspace" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Scan Waste
                </a>
              </li>
              <li>
                <a href="#road-journey" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  How It Works (Journey)
                </a>
              </li>
              <li>
                <a href="#sorting-belt" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Sorting Conveyor
                </a>
              </li>
              <li>
                <a href="#dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Verified Reports
                </a>
              </li>
              <li>
                <a href="#leaderboard" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  EcoRank Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Compliance */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Engineering Standards
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <li>✓ WCAG 2.1 AA Contrast Compliant</li>
              <li>✓ Accessible Keyboard Navigation</li>
              <li>✓ Prefers-Reduced-Motion Support</li>
              <li>✓ Sub-100KB Inline Vector Footprint</li>
              <li>✓ Zero Fake Data Guarantee</li>
            </ul>
          </div>

          {/* Hackathon Track Info */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Hackathon Track
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              Track 06 — Sustainability & Climate Tech<br />
              Theme: ST-01 Waste to Resource<br />
              Built for Kalvium Community
            </p>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.8125rem",
            color: "var(--text-muted)"
          }}
        >
          <div>
            © {new Date().getFullYear()} WasteQuest. Open source circular tech.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Vidit Kochar (Backend Lead)</span>
            <span>Virendra Singh (AI Lead)</span>
            <span>Senior Frontend Engineer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
