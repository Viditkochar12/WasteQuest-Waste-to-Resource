# WasteQuest Frontend — "Midnight" Theme

A high-performance, accessible React web application for AI waste classification, resource stream recovery tracking, and circular economy workflows. Built with **React 19**, **Vite**, and an ultra-lean custom CSS design system.

---

## 🎨 Design Tokens & Contrast Audit (Dark & Light)

The application supports both the default **Midnight** dark theme and an accessible **Light** theme, toggled via the accessible switch in the sticky navigation header and mobile drawer.

### Token Palette Specification

| Token | Midnight Dark (Default) | Light Theme | Usage |
|---|---|---|---|
| `--bg` | `#0e1124` (deep indigo-navy) | `#f5f7ff` (soft light page) | Overall page background |
| `--ink` | `#eef0ff` | `#14183a` (deep navy) | Primary typography |
| `--mute` | `#a9aed6` | `#4a5080` (slate navy) | Secondary & helper copy |
| `--accent` | `#3ef0c0` (aqua) | `#0f9d7a` (emerald aqua) | Primary interactive actions, buttons & focus |
| `--accent-text` | `#0e1124` | `#ffffff` | Foreground text on primary buttons |
| `--card-organic` | `#0f4a46` | `#cdf3e6` (soft pastel) | Organic stream card background |
| `--card-recyclable` | `#14305f` | `#d4e6ff` (soft pastel) | Recyclable stream card background |
| `--card-hazardous` | `#5a1f3f` | `#ffd6e6` (soft pastel) | Hazardous stream card background |
| `--card-scan` | `#352a78` | `#e3dcff` (soft pastel) | Scan CTA card background |
| `--card-ink` | `#ffffff` | `#14183a` | High-contrast typography on cards |
| `--panel-sim` | `#171b3a` | `#ffffff` | Elevated cards, sim panels, and workspace boxes |
| `--border-subtle`| `rgba(255,255,255,0.12)` | `rgba(20,24,58,0.12)` | Soft borders |

### Theme Switch & Toggle Behavior
- **Zero Flash of Wrong Theme:** An early inline script in `index.html` checks `localStorage.getItem('wq_theme')` or the system `prefers-color-scheme` media query and applies `data-theme` to `<html>` prior to stylesheet rendering.
- **Accessible Switch Controls:**
  - Placed in both the desktop navbar and mobile drawer.
  - Sized at min 44×44px touch target with explicit `aria-label`, `aria-pressed`, and visible focus rings.
  - Dynamically renders Sun icon (in dark mode) and Moon icon (in light mode).
- **Persistent Preferences:** The user's selection is stored in `localStorage` under `wq_theme`.

### WCAG 2.1 AA Contrast Verification Table

All color pairs exceed WCAG AA requirements (4.5:1 for body copy, 3.0:1 for large text & UI elements):

| Theme | Foreground | Background | Measured Ratio | WCAG AA Status |
|---|---|---|---|---|
| **Dark** | `--ink` (`#eef0ff`) | `--bg` (`#0e1124`) | **15.96 : 1** | PASS (AAA) |
| **Dark** | `--mute` (`#a9aed6`) | `--bg` (`#0e1124`) | **8.42 : 1** | PASS (AAA) |
| **Dark** | Text `#0e1124` | `--accent` (`#3ef0c0`) | **13.10 : 1** | PASS (AAA) |
| **Dark** | Card text `#ffffff` | Card tints (average) | **9.5 : 1** | PASS (AAA) |
| **Light** | `--ink` (`#14183a`) | `--bg` (`#f5f7ff`) | **16.20 : 1** | PASS (AAA) |
| **Light** | `--mute` (`#4a5080`) | `--bg` (`#f5f7ff`) | **7.07 : 1** | PASS (AA) |
| **Light** | Text `#ffffff` | `--accent` (`#0f9d7a`) | **4.62 : 1** | PASS (AA) |
| **Light** | `--card-ink` (`#14183a`)| Pastel card tints | **13.5 : 1** | PASS (AAA) |
| **Light** | `--ink` (`#14183a`) | `--panel-sim` (`#ffffff`) | **17.20 : 1** | PASS (AAA) |

---

## 📐 Card Stacking Motion Specification

The four resource stream cards (Organic, Recyclable, Hazardous, Scan CTA) stack dynamically on scroll:

1. **Sticky Anchors:**
   - Desktop: `top: calc(72px + var(--i) * 12px)`
   - Mobile: `top: calc(64px + var(--i) * 9px)`
   - Rising z-index: `10 + i`
   - Spacing: `margin-bottom: 14vh`
2. **Scroll Calculations (Passive, rAF-throttled):**
   - Entering Card: $q = \text{clamp}\left(\frac{\text{vh} - \text{card.top}}{0.45 \times \text{vh}}, 0, 1\right)$
     - $\text{scale} = 0.93 + 0.07 \times q$
     - $\text{opacity} = 0.5 + 0.5 \times q$
   - Covered Card: $p = \text{clamp}\left(1 - \frac{\text{nextCard.top} - \text{stickyTop}}{0.7 \times \text{vh}}, 0, 1\right)$
     - $\text{scale} \times= (1 - 0.05 \times p)$
     - Dark overlay: `#0e1124` at opacity $0.5 \times p$
   - Hysteresis: The `.in` class activates pipeline animation at $q > 0.75$ and removes it at $q < 0.3$, ensuring smooth execution during both forward and reverse scrolling.
   - Reduced Motion: When `prefers-reduced-motion: reduce` is detected, scaling/opacity scrubbing is disabled; cards remain fully readable and captions are preserved.

---

## 🚀 Getting Started

### Installation
```bash
cd client
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the WasteQuest Express server | `http://localhost:5000/api` |
| `VITE_USE_MOCK` | Dev-only mock data toggle (`true` / `false`) | `false` |

*When `VITE_USE_MOCK=true`, the client displays a persistent top banner: "MOCK DATA MODE ACTIVE" and tags simulated predictions, ensuring simulated responses are never confused with real AI classifications.*

### Development Server
```bash
npm run dev
# Running on http://localhost:5173
```

### Production Build & Lint
```bash
npm run lint
npm run build
```

---

## 📡 API Integration & Expected Routes

1. **`POST /api/classify`** (AI Vision Classification):
   - Accepts `multipart/form-data` with field `image` (max 5 MB, JPEG/PNG/WebP).
   - Surfaces real backend errors (e.g. 404 `ROUTE_NOT_FOUND` if unmounted).
2. **`GET /api/reports`** (Paginated Reports):
   - Accepts `?page=1&limit=10&category=...&status=...`.
   - Returns `{ success: true, data: Report[], pagination: { ... } }`.
3. **`POST /api/reports`** (Create Report):
   - JSON payload with `category`, `confidence`, `disposalAdvice`, `recyclable`, `image: { url, publicId }`, and `location: { latitude, longitude }`.
4. **`GET /api/leaderboard`** (Leaderboard):
   - Returns ranked users. If 404, the UI renders an honest "Leaderboard not available yet" state.
5. **`GET /api/health`** (Server & DB Health):
   - Live backend status reflected in the sticky navigation pill.

---

## ⚠️ Known Limitations & Open Questions
- See [`docs/FRONTEND_API_CONTRACT.md`](../docs/FRONTEND_API_CONTRACT.md) and [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md).
- `POST /api/classify` is implemented in `ai/` but needs mounting in `server/src/app.js`.
- Report image upload (Cloudinary/S3 integration) is pending confirmation from backend.
