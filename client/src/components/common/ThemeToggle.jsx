import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle({ id = "theme-toggle", className = "", style = {} }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const actionLabel = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={actionLabel}
      title={actionLabel}
      aria-pressed={isLight}
      className={`theme-toggle ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "44px",
        minHeight: "44px",
        width: "44px",
        height: "44px",
        padding: 0,
        borderRadius: "var(--radius-pill)",
        background: "var(--chip-bg)",
        border: "1px solid var(--border-subtle)",
        color: "var(--ink)",
        cursor: "pointer",
        transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        ...style
      }}
    >
      {isLight ? (
        /* Moon Icon shown in light mode */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        /* Sun Icon shown in dark mode */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
