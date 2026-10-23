import { Suspense, lazy } from "react";
import { Navbar } from "./components/common/Navbar";
import { SmartBinHero } from "./components/hero/SmartBinHero";
import { RoadJourney } from "./components/journey/RoadJourney";
import { SortingBelt } from "./components/conveyor/SortingBelt";
import { ScanWorkspace } from "./components/workspace/ScanWorkspace";
import { Footer } from "./components/common/Footer";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { Skeleton } from "./components/common/FeedbackStates";
import { IS_MOCK_ENABLED, API_BASE_URL } from "./services/api";

// Lazy-load Dashboard and Leaderboard sections
const DashboardSection = lazy(() => import("./components/dashboard/DashboardSection"));
const LeaderboardSection = lazy(() => import("./components/dashboard/LeaderboardSection"));

export default function App() {
  const isBaseUrlConfigured = Boolean(API_BASE_URL);

  return (
    <ErrorBoundary title="WasteQuest Application Error">
      {/* Accessible Skip-to-Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Dev Missing Configuration Banner */}
      {!isBaseUrlConfigured && (
        <aside
          role="alert"
          style={{
            background: "#b91c1c",
            color: "#ffffff",
            padding: "0.625rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            textAlign: "center"
          }}
        >
          ⚠️ CONFIGURATION ERROR: <code>VITE_API_BASE_URL</code> is not defined in <code>client/.env</code>.
          Network requests will fail. Please set <code>VITE_API_BASE_URL=http://localhost:5000/api</code>.
        </aside>
      )}

      {/* Persistent Mock Mode Warning Banner */}
      {IS_MOCK_ENABLED && (
        <aside className="mock-banner" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>MOCK DATA MODE ACTIVE:</strong> Responses are simulated for offline local testing and are not real AI classifications.
          </span>
        </aside>
      )}

      {/* Sticky Accessible Navigation */}
      <Navbar />

      {/* Main Semantic Landmark */}
      <main id="main-content">
        {/* Section 1: Hero - Cursor-Following Smart Bin */}
        <ErrorBoundary title="Hero Section Error">
          <SmartBinHero />
        </ErrorBoundary>

        {/* Section 2: Road Journey (How it works) */}
        <ErrorBoundary title="Road Journey Section Error">
          <RoadJourney />
        </ErrorBoundary>

        {/* Section 3: Conveyor Sorting Belt */}
        <ErrorBoundary title="Sorting Belt Section Error">
          <SortingBelt />
        </ErrorBoundary>

        {/* Section 4: Scan Workspace (Plain, fast, real data only) */}
        <ErrorBoundary title="Scan Workspace Error">
          <ScanWorkspace />
        </ErrorBoundary>

        {/* Section 5: Community Dashboard (Lazy Loaded with Suspense) */}
        <ErrorBoundary title="Dashboard Section Error">
          <Suspense
            fallback={
              <section className="section-wrapper container">
                <Skeleton height="300px" borderRadius="var(--radius-lg)" />
              </section>
            }
          >
            <DashboardSection />
          </Suspense>
        </ErrorBoundary>

        {/* Section 6: EcoRank Leaderboard (Lazy Loaded Independently) */}
        <ErrorBoundary title="Leaderboard Section Error">
          <Suspense
            fallback={
              <section className="section-wrapper container">
                <Skeleton height="260px" borderRadius="var(--radius-lg)" />
              </section>
            }
          >
            <LeaderboardSection />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </ErrorBoundary>
  );
}
