export function ResultCard({ result, onSaveReport, isSaving, saveStatus, saveError }) {
  if (!result) return null;

  const {
    category = "general",
    confidence,
    recyclable,
    disposalAdvice,
    itemDescription,
    bin,
    downstreamRoute,
    _isMock
  } = result;

  const formattedConfidence =
    typeof confidence === "number" && !Number.isNaN(confidence)
      ? `${Math.round(confidence * 100)}%`
      : "Confidence unavailable";

  const isLowConfidence =
    typeof confidence === "number" && !Number.isNaN(confidence) && confidence < 0.6;

  // Stream colors matching the Midnight design spec
  const streamMeta = {
    organic: { border: "var(--lit-organic)", label: "Organic stream", icon: "🍏" },
    plastic: { border: "var(--lit-recyclable)", label: "Recyclable (plastic)", icon: "🧴" },
    metal: { border: "var(--lit-recyclable)", label: "Recyclable (metal)", icon: "🥫" },
    paper: { border: "var(--lit-recyclable)", label: "Recyclable (paper)", icon: "📄" },
    glass: { border: "var(--lit-recyclable)", label: "Recyclable (glass)", icon: "🍾" },
    e_waste: { border: "var(--lit-hazardous)", label: "Hazardous / E-Waste", icon: "🔋" },
    hazardous: { border: "var(--lit-hazardous)", label: "Hazardous waste", icon: "⚠️" },
    general: { border: "var(--border-subtle)", label: "Residual municipal waste", icon: "🗑️" },
    unknown: { border: "var(--border-subtle)", label: "Unclassified material", icon: "❓" }
  };

  const styleMeta = streamMeta[category.toLowerCase()] || streamMeta.general;

  return (
    <article
      aria-label="Waste Classification Result"
      style={{
        background: "var(--panel-sim)",
        border: `1.5px solid ${styleMeta.border}`,
        borderRadius: "var(--radius-lg)",
        padding: "clamp(1.25rem, 3.5vw, 2rem)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Dev Mock Warning indicator */}
      {(_isMock || itemDescription?.includes("(mock mode)")) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#5a1f3f",
            color: "#ffffff",
            fontSize: "0.6875rem",
            fontWeight: 700,
            padding: "0.25rem 0.75rem",
            borderBottomLeftRadius: "var(--radius-sm)",
            textTransform: "uppercase"
          }}
        >
          Mock Prediction
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "2.25rem" }} aria-hidden="true">
            {bin?.symbol || styleMeta.icon}
          </span>
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: styleMeta.border,
                fontWeight: 600
              }}
            >
              Detected Category
            </span>
            <h3 style={{ fontSize: "1.5rem", textTransform: "capitalize", margin: 0, color: "var(--ink)" }}>
              {category.replace(/_/g, " ")}
            </h3>
          </div>
        </div>

        {/* Real Confidence Badge */}
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--mute)"
            }}
          >
            AI Confidence
          </span>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: isLowConfidence ? "var(--status-warning)" : "var(--accent)"
            }}
          >
            {formattedConfidence}
          </div>
        </div>
      </div>

      {/* Low Confidence Warning Notice */}
      {isLowConfidence && (
        <div
          role="status"
          style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            color: "#fbbf24",
            fontSize: "0.875rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Low confidence. Please verify manually.</span>
        </div>
      )}

      {/* Recyclability & Destination Stream */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase" }}>
            Recyclable
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: recyclable ? "var(--accent)" : "var(--status-danger)"
              }}
            />
            <strong style={{ color: recyclable ? "var(--accent)" : "#ff9cc4", fontSize: "1.1rem" }}>
              {recyclable ? "Yes — Divert from landfill" : "No — General residual"}
            </strong>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase" }}>
            Assigned Bin
          </span>
          <div style={{ marginTop: "0.25rem", fontWeight: 600, color: "var(--ink)", fontSize: "1.1rem" }}>
            {bin?.name || styleMeta.label}
          </div>
        </div>
      </div>

      {/* Identified Item Details */}
      {itemDescription && (
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--mute)", textTransform: "uppercase" }}>
            Identified Material
          </span>
          <p style={{ color: "var(--ink)", fontWeight: 500, marginTop: "0.25rem" }}>
            {itemDescription}
          </p>
        </div>
      )}

      {/* Disposal Advice */}
      <div
        style={{
          background: "rgba(62, 240, 192, 0.07)",
          borderLeft: "3px solid var(--accent)",
          padding: "1rem",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          marginBottom: "1.25rem"
        }}
      >
        <strong style={{ display: "block", color: "var(--accent)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
          Disposal Advice
        </strong>
        <p style={{ color: "var(--ink)", fontSize: "0.9375rem", lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>
          {disposalAdvice || "Deposit according to local municipal guidelines."}
        </p>
      </div>

      {/* Downstream Recovery Route */}
      {downstreamRoute && (
        <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--mute)", fontWeight: 600 }}>Downstream route: </span>
          <span style={{ color: "var(--ink)" }}>{downstreamRoute}</span>
        </div>
      )}

      {/* Save Report Flow */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        <div>
          {saveStatus === "saved" ? (
            <span
              role="status"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: "0.9375rem"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Report confirmed and saved!
            </span>
          ) : saveStatus === "error" ? (
            <span role="alert" style={{ color: "#ff9cc4", fontSize: "0.875rem" }}>
              {saveError || "Failed to save report to backend."}
            </span>
          ) : (
            <span style={{ fontSize: "0.8125rem", color: "var(--mute)" }}>
              Submit report to record your recovery entry.
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSaveReport}
          disabled={isSaving || saveStatus === "saved"}
          style={{ minWidth: "150px" }}
        >
          {isSaving ? "Saving report..." : saveStatus === "saved" ? "Saved" : "Save report"}
        </button>
      </div>
    </article>
  );
}
