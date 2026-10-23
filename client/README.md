# WasteQuest Client (Frontend)

Modern, high-performance web application for AI waste classification, circular economy tracking, and community resource recovery. Built with **React 19**, **Vite**, and **Vanilla CSS Design System**.

---

## 🌿 Overview of Key Features

1. **Smart Bin Hero (Section 1):**
   - Inline SVG robotic bin with real-time cursor/touch pointer tracking eye using lerp smoothing (`pos += (target - pos) * 0.12`).
   - Falling waste icons (bottle, can, paper, glass, battery, organic) sucked into the aperture with scan ring pulse and dynamic routing labels.
   - Pauses automatically when off-screen and on tab `visibilitychange`.
   - Mandatory visible caption: *"Demo animation. Real classification happens in the Scan workspace below."*

2. **Road Journey (Section 2 - How It Works):**
   - Parallax roadside scene with walking sustainability character equipped with an optical phone scanner.
   - Five interactive stops: **Scan**, **Classify**, **Route**, **Recover**, and **Climb the Leaderboard**.
   - Every animation features visible and screen-reader accessible captions detailing what each step represents.

3. **Conveyor Sorting Belt (Section 3):**
   - Horizontally looping track simulating Material Recovery Facility (MRF) optical sorting.
   - Five segregated bins: *Plastic*, *Paper/Cardboard*, *Metal*, *Glass*, and *Other/Residual*.
   - Includes accessible Pause / Resume toggle button and explanatory caption.

4. **Scan Workspace (Section 4 - Live AI Intake):**
   - Keyboard accessible drag-and-drop zone and native file picker (`<input type="file">`).
   - Client-side validation: Max 5 MB, allowed formats: JPEG, PNG, and WebP.
   - Specific user feedback for HEIC format from iOS, empty (0-byte) files, and oversized files.
   - Image preview using `URL.createObjectURL` with automated memory cleanup (`revokeObjectURL`).
   - AbortController support with a 30-second timeout and user Cancel button. Prevents double submission.
   - Live result card: displays detected category, real confidence percentage, recyclable status, assigned bin, disposal advice, circular route, and estimated environmental impact (CO2 & water savings).
   - "Save Report" flow: integrates HTML5 Geolocation API and posts to backend `POST /api/reports`.

5. **Community Dashboard & EcoRank Leaderboard (Sections 5 & 6):**
   - Code-split and lazy-loaded via `React.lazy` + `Suspense` when nearing the viewport.
   - Stats (Items Scanned, Recyclables Diverted, EcoPoints) calculated strictly from live backend report data. Displays "—" when data is unavailable (zero fake data policy).
   - Recent reports list with loading skeleton, empty state, and error retry state.
   - Leaderboard with honest backend reporting (displays *"Leaderboard not available yet"* if backend route is not mounted).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- npm 9+

### Installation
```bash
cd client
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the WasteQuest Express server | `http://localhost:5000/api` |
| `VITE_USE_MOCK` | Dev-only mock data toggle (`true` / `false`) | `false` |

> **Note on Mock Mode:** When `VITE_USE_MOCK=true`, the client displays a persistent top banner: *"MOCK DATA MODE ACTIVE"* and explicitly marks simulated cards as `Mock Prediction`. This allows frontend testing even if backend vision services are offline.

### Running Locally
```bash
# Start development server on http://localhost:5173
npm run dev
```

### Building for Production
```bash
# Production bundle with code splitting
npm run build

# Preview production build locally
npm run preview
```

### Running Linter
```bash
npm run lint
```

---

## 📡 API Routes and Expected Shapes

### 1. `POST /api/classify` (AI Vision Classification)
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Field:** `image` (binary file buffer, max 5 MB, JPEG/PNG/WebP)
- **Expected Success (200):**
  ```json
  {
    "success": true,
    "data": {
      "category": "plastic",
      "confidence": 0.94,
      "itemDescription": "Crushed PET water bottle",
      "recyclable": true,
      "disposalAdvice": "Rinse off residue, crush container, and deposit in the dry recyclables bin.",
      "bin": {
        "name": "Blue Bin (Dry Recyclables)",
        "color": "#2563EB",
        "symbol": "♻️"
      },
      "downstreamRoute": "MRF optical sorting -> Shredded into PET flakes -> Remanufactured",
      "environmentalImpact": {
        "co2SavedKg": 0.082,
        "waterSavedLiters": 1.5,
        "landfillDivertedGrams": 30
      }
    }
  }
  ```
- **Error (400, 415, 422):**
  ```json
  {
    "success": false,
    "error": {
      "code": "LOW_CONFIDENCE | INVALID_FILE_TYPE | FILE_TOO_LARGE | NOT_WASTE",
      "message": "Descriptive message"
    }
  }
  ```

### 2. `GET /api/reports` (List Reports)
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "category": "plastic",
        "confidence": 0.94,
        "recyclable": true,
        "disposalAdvice": "...",
        "createdAt": "2026-10-23T19:00:00.000Z"
      }
    ]
  }
  ```

### 3. `POST /api/reports` (Create Report)
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Payload:**
  ```json
  {
    "category": "plastic",
    "confidence": 0.94,
    "disposalAdvice": "...",
    "recyclable": true,
    "image": { "url": "...", "publicId": "..." },
    "location": { "latitude": 37.7749, "longitude": -122.4194 }
  }
  ```

### 4. `GET /api/leaderboard` (EcoRank Leaderboard)
- **Method:** `GET`
- **Response (when implemented):**
  ```json
  {
    "success": true,
    "data": [
      { "rank": 1, "name": "EcoPioneer", "points": 850, "itemsCount": 42 }
    ]
  }
  ```

---

## ♿ Accessibility & Performance Compliance
- **WCAG 2.1 AA Contrast:** All text meets or exceeds 4.5:1 contrast against surface backgrounds.
- **Motion Reduction:** Fully respects `prefers-reduced-motion: reduce`. Moving conveyors, falling items, and characters freeze into static accessible positions.
- **Screen Reader Support:** Live announcements via `role="status"` and `aria-live="polite"` on classification and error changes; `role="alert"` on failures.
- **Touch Target Sizing:** All buttons and inputs feature minimum dimensions >= 44×44px.
- **Sub-100KB Asset Footprint:** Inline SVGs and CSS transforms only — no heavy 3D or video libraries.

---

## ⚠️ Known Limitations & Open Questions for Backend (Vidit)
See [`docs/FRONTEND_API_CONTRACT.md`](../docs/FRONTEND_API_CONTRACT.md) and [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md) for full architectural gap analysis:
1. `POST /api/classify` is implemented in Virendra's AI branch (`origin/feature/ai-classification`) but is not yet mounted in Express `server/src/app.js`.
2. `POST /api/reports` requires `image.url` and `publicId`, which `/classify` does not yet generate (pending Cloudinary integration decision).
3. Browser Geolocation is queried during report submission; if denied by user, default coordinates are supplied to avoid crashing `server/src/models/Report.js`.
