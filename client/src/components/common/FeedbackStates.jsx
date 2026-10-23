/**
 * Accessible AnimatedCaption component
 */
export function AnimatedCaption({ icon, text, style = {} }) {
  return (
    <div className="section-caption" style={style}>
      {icon ? (
        <span aria-hidden="true" style={{ display: "inline-flex" }}>
          {icon}
        </span>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      )}
      <span>{text}</span>
    </div>
  );
}

/**
 * Reusable Loading Skeleton
 */
export function Skeleton({ width = "100%", height = "20px", borderRadius = "var(--radius-sm)", style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.8s infinite ease-in-out",
        ...style
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Reusable ErrorState with Retry CTA
 */
export function ErrorState({ title = "Unable to load data", message, onRetry, actionLabel = "Try again" }) {
  return (
    <div
      role="alert"
      style={{
        padding: "2rem",
        textAlign: "center",
        background: "var(--status-danger-bg)",
        border: "1px solid rgba(239, 68, 68, 0.25)",
        borderRadius: "var(--radius-md)",
        color: "var(--text-primary)"
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(239, 68, 68, 0.2)",
          color: "var(--status-danger)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem"
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h4 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>{title}</h4>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem", maxWidth: "480px", marginInline: "auto" }}>
        {message || "An unexpected error occurred while communicating with the service."}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry} style={{ minHeight: "40px" }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Reusable EmptyState
 */
export function EmptyState({ icon, title, message, action }) {
  return (
    <div
      style={{
        padding: "3rem 1.5rem",
        textAlign: "center",
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-medium)",
        borderRadius: "var(--radius-lg)"
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--status-success-bg)",
          color: "var(--brand-primary)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem"
        }}
      >
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        )}
      </div>
      <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>{title}</h4>
      <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", maxWidth: "440px", marginInline: "auto", marginBottom: action ? "1.5rem" : 0 }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
