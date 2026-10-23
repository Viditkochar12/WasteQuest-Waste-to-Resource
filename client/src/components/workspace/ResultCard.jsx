
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
    environmentalImpact,
    _isMock
  } = result;

  const formattedConfidence =
    typeof confidence === "number" && !Number.isNaN(confidence)
      ? `${Math.round(confidence * 100)}%`
      : "Confidence unavailable";

  const isLowConfidence =
    typeof confidence === "number" && !Number.isNaN(confidence) && confidence < 0.6;

  // Canonical theme styling per category
  const categoryStyles = {
    plastic: { border: "var(--cat-plastic)", label: "Plastic Recyclable", icon: "🧴" },
    paper: { border: "var(--cat-paper)", label: "Paper & Cardboard", icon: "📦" },
    glass: { border: "var(--cat-glass)", label: "Glass Container", icon: "🍾" },
    metal: { border: "var(--cat-metal)", label: "Metal & Aluminum", icon: "🥫" },
    organic: { border: "var(--cat-organic)", label: "Organic Compostable", icon: "🍎" },
    e_waste: { border: "var(--cat-ewaste)", label: "Electronic Waste", icon: "🔋" },
    general: { border: "var(--cat-general)", label: "General Residual Waste", icon: "🗑️" }
  };

  const styleMeta = categoryStyles[category.toLowerCase()] || categoryStyles.general;

  return (
    <article
      aria-label="Waste Classification Result"
      style={{
        background: "var(--bg-surface-elevated)",
        border: `1.5px solid ${styleMeta.border}`,
        borderRadius: "var(--radius-lg)",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        boxShadow: "var(--shadow-elevated)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Dev Mock Warning indicator if in mock mode */}
      {_isMock && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#d97706",
            color: "#fff",
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
          <span style={{ fontSize: "2rem" }} aria-hidden="true">
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
            <h3 style={{ fontSize: "1.5rem", textTransform: "capitalize", margin: 0 }}>
              {category.replace(/_/g, " ")}
            </h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-muted)"
            }}
          >
            AI Confidence
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: isLowConfidence ? "var(--status-warning)" : "var(--brand-primary)"
            }}
          >
            {formattedConfidence}
          </span>
        </div>
      </div>

      {/* Low Confidence Warning */}
      {isLowConfidence && (
        <div
          role="status"
          style={{
            background: "var(--status-warning-bg)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            color: "var(--status-warning)",
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
          <span>Low confidence. Please verify the classification manually before disposing.</span>
        </div>
      )}

      {/* Recyclability & Bin Card */}
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
            background: "var(--bg-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Recyclability Status</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: recyclable ? "var(--status-success)" : "var(--status-danger)"
              }}
            />
            <strong style={{ color: recyclable ? "var(--status-success)" : "var(--status-danger)", fontSize: "1.125rem" }}>
              {recyclable ? "Recyclable / Compostable" : "Non-Recyclable (Landfill)"}
            </strong>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Assigned Bin</span>
          <div style={{ marginTop: "0.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {bin?.name || `${styleMeta.label}`}
          </div>
        </div>
      </div>

      {/* Item Description if available */}
      {itemDescription && (
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Identified Object
          </span>
          <p style={{ color: "var(--text-primary)", fontWeight: 500, marginTop: "0.25rem" }}>
            {itemDescription}
          </p>
        </div>
      )}

      {/* Disposal Advice */}
      <div
        style={{
          background: "rgba(16, 185, 129, 0.08)",
          borderLeft: "3px solid var(--brand-primary)",
          padding: "1rem",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          marginBottom: "1.25rem"
        }}
      >
        <strong style={{ display: "block", color: "var(--brand-primary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
          Disposal Advice
        </strong>
        <p style={{ color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>
          {disposalAdvice || "No specific instructions available for this category."}
        </p>
      </div>

      {/* Downstream Recovery Route if available */}
      {downstreamRoute && (
        <div style={{ marginBottom: "1.25rem", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Circular Route: </span>
          <span style={{ color: "var(--text-secondary)" }}>{downstreamRoute}</span>
        </div>
      )}

      {/* Environmental Impact metrics if provided */}
      {environmentalImpact && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "0.875rem 1rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            border: "1px solid var(--border-subtle)"
          }}
        >
          {environmentalImpact.co2SavedKg > 0 && (
            <div style={{ fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-muted)" }}>CO₂ Avoided: </span>
              <strong style={{ color: "var(--brand-primary)" }}>~{(environmentalImpact.co2SavedKg * 1000).toFixed(0)}g</strong>
            </div>
          )}
          {environmentalImpact.waterSavedLiters > 0 && (
            <div style={{ fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Water Preserved: </span>
              <strong style={{ color: "#38bdf8" }}>~{environmentalImpact.waterSavedLiters} L</strong>
            </div>
          )}
          {environmentalImpact.landfillDivertedGrams > 0 && (
            <div style={{ fontSize: "0.8125rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Landfill Diverted: </span>
              <strong style={{ color: "#fbbf24" }}>~{environmentalImpact.landfillDivertedGrams}g</strong>
            </div>
          )}
        </div>
      )}

      {/* Save Report CTA */}
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
                color: "var(--status-success)",
                fontWeight: 600,
                fontSize: "0.9375rem"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Report saved to database!
            </span>
          ) : saveStatus === "error" ? (
            <span role="alert" style={{ color: "var(--status-danger)", fontSize: "0.875rem" }}>
              {saveError || "Failed to save report to backend."}
            </span>
          ) : (
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Submit report to record your recovery item.
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
          {isSaving ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(0,0,0,0.2)",
                  borderTopColor: "#000",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}
              />
              Saving report...
            </>
          ) : saveStatus === "saved" ? (
            "Saved"
          ) : (
            "Save report"
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </article>
  );
}
