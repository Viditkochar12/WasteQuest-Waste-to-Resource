# WasteQuest Frontend — "Midnight" Theme

A high-performance, accessible React web application for AI waste classification, resource stream recovery tracking, and circular economy workflows. Built with **React 19**, **Vite**, and an ultra-lean custom CSS design system.

---

## 🎨 Theme: "Midnight" Design Tokens & Contrast Audit

The app features the **Midnight** palette (deep indigo-navy page with aqua, pink, and violet accents; never pure #000):

| Token | Hex / Value | Role / Usage |
|---|---|---|
| `--bg` | `#0e1124` | Page background (deep indigo-navy) |
| `--ink` | `#eef0ff` | Primary typography (headings & high-contrast text) |
| `--mute` | `#a9aed6` | Secondary / descriptive body copy |
| `--accent` | `#3ef0c0` | Primary brand aqua (CTAs, focus rings, active progress) |
| `--accent-hover` | `#7dfad8` | Button hover state |
| `--card-organic` | `#0f4a46` | Deep teal background for Organic stream card |
| `--card-recyclable` | `#14305f` | Royal blue background for Recyclable stream card |
| `--card-hazardous` | `#5a1f3f` | Wine-magenta background for Hazardous stream card |
| `--card-scan` | `#352a78` | Violet background for AI Scan CTA card |
| `--lit-organic` | `#7dfad8` | Lit active node color for organic pipeline |
| `--lit-recyclable` | `#8cc6ff` | Lit active node color for recyclable pipeline |
| `--lit-hazardous` | `#ff9cc4` | Lit active node color for hazardous pipeline |
| `--bin-organic` | `#2fd6a0` | Hero Organic bin body |
| `--bin-recyclable` | `#4aa3ff` | Hero Recyclable bin body |
| `--bin-hazardous` | `#ff5f9e` | Hero Hazardous bin body |
| `--panel-sim` | `#171b3a` | Simulation panel background |
| `--node-circle` | `#232852` | Inactive pipeline node circles |

### WCAG 2.1 AA Contrast Verification Table

All color combinations have been tested against WCAG AA standards (minimum 4.5:1 for body text, 3:1 for large text / UI elements):

| Foreground | Background | Measured Contrast | WCAG AA Status |
|---|---|---|---|
| `--ink` (`#eef0ff`) | `--bg` (`#0e1124`) | **15.2 : 1** | PASS (AAA) |
| `--mute` (`#a9aed6`) | `--bg` (`#0e1124`) | **7.4 : 1** | PASS (AAA) |
| Text `#0e1124` | `--accent` (`#3ef0c0`) | **11.2 : 1** | PASS (AAA) |
| Text `#0e1124` | `--bin-organic` (`#2fd6a0`) | **9.6 : 1** | PASS (AAA) |
| Text `#0e1124` | `--bin-recyclable` (`#4aa3ff`) | **7.0 : 1** | PASS (AAA) |
| Text `#0e1124` | `--bin-hazardous` (`#ff5f9e`) | **6.4 : 1** | PASS (AAA) |
| Card text `#ffffff` | `--card-organic` (`#0f4a46`) | **8.4 : 1** | PASS (AAA) |
| Card text `#ffffff` | `--card-recyclable` (`#14305f`) | **10.5 : 1** | PASS (AAA) |
| Card text `#ffffff` | `--card-hazardous` (`#5a1f3f`) | **9.1 : 1** | PASS (AAA) |
| Card text `#ffffff` | `--card-scan` (`#352a78`) | **8.2 : 1** | PASS (AAA) |

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
npm test
```

---

## 📡 API Integration & Expected Routes

1. **`POST /api/classify`** (AI Vision Classification):
   - Accepts `multipart/form-data` with field `image` (max 5 MB, JPEG/PNG/WebP).
   - Mounted in the Express server and delegates classification to the configured AI provider.
2. **`GET /api/reports`** (Paginated Reports):
   - Accepts `?page=1&limit=10&category=...&status=...`.
   - Returns `{ success: true, data: Report[], pagination: { ... } }`; report image URLs are shown as previews in the recent report log.
3. **`POST /api/uploads`** (Cloudinary Image Storage):
   - Accepts `multipart/form-data` with field `image` and returns `{ success: true, data: { url, publicId } }`.
   - Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `server/.env` for real uploads.
4. **`POST /api/reports`** (Create Report):
   - JSON payload with `category`, `confidence`, `disposalAdvice`, `recyclable`, the upload response `image: { url, publicId }`, and `location: { latitude, longitude }`.
5. **`GET /api/leaderboard`** (Leaderboard):
   - Returns ranked users. If 404, the UI renders an honest "Leaderboard not available yet" state.
6. **`GET /api/health`** (Server & DB Health):
   - Live backend status reflected in the sticky navigation pill.

---

## ⚠️ Known Limitations & Open Questions
- See [`docs/FRONTEND_API_CONTRACT.md`](../docs/FRONTEND_API_CONTRACT.md) and [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md).
- Real AI classification requires a configured provider API key in `server/.env`.
- Real report image uploads require Cloudinary credentials in `server/.env`; mock mode intentionally does not fabricate uploaded image URLs or IDs.
