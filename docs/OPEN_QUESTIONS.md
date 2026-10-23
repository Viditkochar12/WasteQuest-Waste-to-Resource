# Open Questions for Backend & AI Integration (Vidit & Virendra)

## 1. Image Storage & URL Generation (`/classify` vs `POST /reports`)
- **Current Situation:**
  - `POST /api/reports` strictly enforces that `image.url` (string) and `image.publicId` (string) must be non-empty strings.
  - The merged AI module in `ai/` processes an in-memory buffer via `multer.memoryStorage()` and returns category, confidence, advice, etc., but **does NOT upload the image to cloud storage (e.g., Cloudinary, S3)** or return an image URL/publicId.
- **Questions for Vidit:**
  1. Does the backend plan to upload the image to Cloudinary/S3 inside `POST /api/classify` and return `{ image: { url, publicId } }` in the classification response?
  2. Or will there be a dedicated `POST /api/upload` endpoint?
  3. Or should `POST /api/classify` automatically create and save the `Report` document in MongoDB directly upon successful classification?
- **Frontend Architecture Decision:**
  The frontend service layer (`src/services/api.js`) separates classification (`classifyImage`) from report submission (`createReport`). If the backend updates `POST /api/classify` to auto-persist reports or return image credentials, the frontend service layer only requires changing a single line to adopt it.

---

## 2. Geolocation Requirements for Reports
- **Current Situation:**
  - `server/src/models/Report.js` and `server/src/routes/reports.routes.js` require `location.latitude` and `location.longitude` as numbers between `[-90, 90]` and `[-180, 180]`. If omitted, the server rejects the request with HTTP 400 `INVALID_REPORT`.
- **Questions for Vidit:**
  1. Should geolocation be strictly required for all reports, or should the schema allow optional location coordinates for privacy-conscious users who deny browser GPS permissions?
  2. If the user denies browser geolocation access, should the report still be saved (e.g., default `0, 0` or null), or should the submission be blocked?
- **Frontend Architecture Decision:**
  The frontend checks the browser's HTML5 `navigator.geolocation` API with clear user notification. If permitted, real coordinates are sent; if denied or unavailable, an informative alert is shown requesting permission or using a neutral fallback, pending backend confirmation.

---

## 3. Mounting of `POST /api/classify` in Express
- **Current Situation:**
  - Virendra's AI module has been merged into `main` inside the `ai/` directory.
  - The Express server in `server/src/app.js` currently only mounts `/api/health` and `/api/reports`. `POST /api/classify` currently returns `404 ROUTE_NOT_FOUND`.
- **Question for Vidit:**
  - When will `server/src/app.js` mount the classification route with `multer` to connect Express with `ai/src/classifyWaste.js`?

---

## 4. Leaderboard Schema and Endpoint
- **Current Situation:**
  - The frontend specification includes a Leaderboard section displaying top recyclers and EcoPoints.
  - Currently `GET /api/leaderboard` returns 404.
- **Question for Vidit:**
  - What will be the exact response shape for `GET /api/leaderboard`? (e.g. `[{ rank: 1, name: "EcoHero", points: 450, badge: "Gold Recycler" }]`).
- **Frontend Architecture Decision:**
  The frontend attempts to fetch from `GET /api/leaderboard`. If it returns 404 or fails, it renders an informative *"Leaderboard not available yet"* UI state instead of crashing or showing fake data.
