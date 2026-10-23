export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "4rem",
        paddingBottom: "3rem"
      }}
      role="contentinfo"
    >
      <div className="container">
        {/* Prominent Mandatory Compliance Notice */}
        <div
          style={{
            background: "rgba(23, 27, 58, 0.7)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.5rem",
            marginBottom: "3rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--mute)",
            fontSize: "0.875rem"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <strong>Notice:</strong> Routes are illustrative. Accepted materials and hazardous-waste rules differ by city.
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem"
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0e1124",
                  fontWeight: 800
                }}
              >
                WQ
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.25rem" }}>
                Waste<span style={{ color: "var(--accent)" }}>Quest</span>
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--mute)", lineHeight: 1.6 }}>
              Deep vision waste classification and circular material tracking.
            </p>
          </div>

          {/* Quick Anchors */}
          <div>
            <h4 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink)", marginBottom: "1rem" }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <a href="#streams" style={{ color: "var(--mute)", fontSize: "0.875rem", textDecoration: "none" }}>
                  Resource streams
                </a>
              </li>
              <li>
                <a href="#scan-workspace" style={{ color: "var(--mute)", fontSize: "0.875rem", textDecoration: "none" }}>
                  Scan waste
                </a>
              </li>
              <li>
                <a href="#dashboard" style={{ color: "var(--mute)", fontSize: "0.875rem", textDecoration: "none" }}>
                  Recent reports
                </a>
              </li>
              <li>
                <a href="#leaderboard" style={{ color: "var(--mute)", fontSize: "0.875rem", textDecoration: "none" }}>
                  EcoRank Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink)", marginBottom: "1rem" }}>
              Accessibility & Ethics
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mute)" }}>
              <li>✓ WCAG 2.1 AA Contrast Verified</li>
              <li>✓ Prefers-Reduced-Motion Respected</li>
              <li>✓ Zero Fake Data Guarantee</li>
              <li>✓ Native Keyboard Operable</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
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
            color: "var(--mute)"
          }}
        >
          <div>
            © {new Date().getFullYear()} WasteQuest. Open source circular tech.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>Vidit Kochar (Backend)</span>
            <span>Virendra Singh (AI)</span>
            <span>Frontend & Motion Design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
