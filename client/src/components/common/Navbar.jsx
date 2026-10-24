import { useState, useEffect, useRef } from "react";
import { getHealth } from "../../services/api";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [serverHealth, setServerHealth] = useState({ status: "checking", label: "Checking API" });

  const headerRef = useRef(null);
  const mobileToggleRef = useRef(null);

  // Passive rAF scroll progress calculation
  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Health check on mount
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
          label: isDbConnected ? "API & DB Online" : "API Live (DB offline)"
        });
      } else {
        setServerHealth({
          status: "offline",
          label: "API Offline"
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

  // Escape key closes mobile menu and restores focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Outside click listener closes mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#streams", label: "Resource streams" },
    { href: "#scan-workspace", label: "Scan waste", primary: true },
    { href: "#dashboard", label: "Reports" },
    { href: "#leaderboard", label: "Leaderboard" }
  ];

  return (
    <header
      ref={headerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 900,
        backgroundColor: "var(--nav-bg)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
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
            color: "var(--ink)"
          }}
          aria-label="WasteQuest Home"
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(62, 240, 192, 0.4)"
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0e1124"
              strokeWidth="2.75"
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
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "1.35rem",
              letterSpacing: "-0.02em"
            }}
          >
            Waste<span style={{ color: "var(--accent)" }}>Quest</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="desktop-nav"
          style={{
            display: "none",
            alignItems: "center",
            gap: "1.75rem"
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.primary ? "btn btn-primary" : "nav-link"}
              style={
                !link.primary
                  ? {
                      color: "var(--mute)",
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      transition: "color 150ms ease"
                    }
                  : {
                      fontSize: "0.875rem",
                      padding: "0.45rem 1.15rem",
                      minHeight: "38px"
                    }
              }
            >
              {link.label}
            </a>
          ))}

          {/* Theme switch button */}
          <ThemeToggle id="desktop-theme-toggle" />

          {/* Health indicator pill */}
          <div
            title={`Backend Status: ${serverHealth.label}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-pill)",
              background: "var(--chip-bg)",
              border: "1px solid var(--border-subtle)",
              color: "var(--mute)"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  serverHealth.status === "online"
                    ? "var(--accent)"
                    : serverHealth.status === "warning"
                    ? "var(--status-warning)"
                    : "var(--status-danger)",
                boxShadow:
                  serverHealth.status === "online" ? "0 0 8px var(--accent)" : "none"
              }}
            />
            <span>
              {serverHealth.status === "online"
                ? "API Live"
                : serverHealth.status === "warning"
                ? "DB Disconnected"
                : "API Offline"}
            </span>
          </div>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={mobileToggleRef}
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="mobile-toggle"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            color: "var(--ink)",
            cursor: "pointer"
          }}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
          id="mobile-nav"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg)",
            padding: "1.25rem 1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem"
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
                padding: "0.85rem 1.25rem"
              }}
            >
              {link.label}
            </a>
          ))}

          {/* Theme switch row in mobile drawer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border-subtle)"
            }}
          >
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)" }}>Appearance</span>
            <ThemeToggle id="mobile-theme-toggle" />
          </div>

          <div
            style={{
              paddingTop: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--mute)"
            }}
          >
            Backend: {serverHealth.label}
          </div>
        </div>
      )}

      {/* Aqua Scroll Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          width: `${scrollProgress}%`,
          background: "var(--accent)",
          boxShadow: "0 0 10px var(--accent)",
          transition: "width 80ms linear"
        }}
        aria-hidden="true"
      />

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        .nav-link:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </header>
  );
}
