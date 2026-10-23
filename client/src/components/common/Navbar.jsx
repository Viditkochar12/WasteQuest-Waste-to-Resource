import { useState, useEffect } from "react";
import { getHealth } from "../../services/api";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState({ status: "checking", label: "Checking server" });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function checkHealth() {
      const res = await getHealth({ signal: controller.signal });
      if (!mounted) return;

      if (res.ok) {
        const isDbConnected = res.data?.database === "connected";
        setServerHealth({
          status: isDbConnected ? "online" : "warning",
          label: isDbConnected ? "API & DB Online" : "Server Online (DB offline)"
        });
      } else {
        setServerHealth({
          status: "offline",
          label: "Backend Offline"
        });
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  // Handle escape key to close mobile menu
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#scan-workspace", label: "Scan Waste", primary: true },
    { href: "#road-journey", label: "How it works" },
    { href: "#sorting-belt", label: "Sorting Belt" },
    { href: "#dashboard", label: "Reports" },
    { href: "#leaderboard", label: "Leaderboard" }
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 900,
        backgroundColor: "var(--bg-surface-glass)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)"
      }}
    >
      <div
        className="container"
        style={{
          height: "var(--nav-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        {/* Brand Logo */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            color: "var(--text-primary)"
          }}
          aria-label="WasteQuest Home"
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.35)"
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.2a1.8 1.8 0 0 0 1.583-.914.8.8 0 0 0-.017-.816L17.2 11" />
              <path d="m21.8 4.2-2.9 5.3" />
              <path d="m3.3 4.2 2.9 5.3" />
              <path d="M12 2v7" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.375rem",
              letterSpacing: "-0.03em"
            }}
          >
            Waste<span style={{ color: "var(--brand-primary)" }}>Quest</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          style={{
            display: "none",
            alignItems: "center",
            gap: "1.75rem"
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.primary ? "btn btn-primary" : "nav-link"}
              style={
                !link.primary
                  ? {
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                      transition: "color var(--transition-fast)"
                    }
                  : {
                      fontSize: "0.875rem",
                      padding: "0.5rem 1rem",
                      minHeight: "38px"
                    }
              }
            >
              {link.label}
            </a>
          ))}

          {/* Health pill */}
          <div
            title={`Backend Status: ${serverHealth.label}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  serverHealth.status === "online"
                    ? "var(--brand-primary)"
                    : serverHealth.status === "warning"
                    ? "var(--status-warning)"
                    : "var(--status-danger)",
                boxShadow:
                  serverHealth.status === "online"
                    ? "0 0 8px var(--brand-primary)"
                    : "none"
              }}
            />
            <span>{serverHealth.status === "online" ? "API Live" : serverHealth.status === "warning" ? "DB Disconnected" : "API Offline"}</span>
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="mobile-menu-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            cursor: "pointer"
          }}
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            padding: "1.25rem 1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={link.primary ? "btn btn-primary" : "btn btn-secondary"}
              style={{
                justifyContent: "flex-start",
                padding: "0.875rem 1.25rem"
              }}
            >
              {link.label}
            </a>
          ))}

          <div
            style={{
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--text-muted)"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  serverHealth.status === "online"
                    ? "var(--brand-primary)"
                    : serverHealth.status === "warning"
                    ? "var(--status-warning)"
                    : "var(--status-danger)"
              }}
            />
            <span>Backend: {serverHealth.label}</span>
          </div>
        </div>
      )}

      {/* Media query helper styles */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        .nav-link:hover {
          color: var(--brand-primary) !important;
        }
      `}</style>
    </header>
  );
}
