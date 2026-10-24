# WasteQuest AI Classification Module & Backend API Integration

> **Track 06 — Sustainability & Climate Tech (ST-01 | Waste to Resource)**  
> Developed for the WasteQuest Team (Virendra · AI Lead | Vidit · Backend Integration)

---

## 🌟 Overview
The `ai/` module provides computer vision classification and intelligent segregation guidance for waste-to-resource recovery. It inspects images of discarded objects, categorizes them into standard waste streams, routes them to proper color-coded bins, details downstream recovery pipelines, and calculates estimated environmental impact (CO2 & water savings).

The backend Express server exposes this capability via the `POST /api/classify` REST endpoint.

---

## 📡 API Specification: `POST /api/classify`

### Request Requirements
- **HTTP Method**: `POST`
- **URL**: `http://localhost:5000/api/classify` (or `/api/classify` relative to backend origin)
- **Content-Type**: `multipart/form-data`
- **Multipart Field Name**: `image` (the image file must be sent under the key `image`)
- **Supported Formats**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp` (header magic byte verification enforced)
- **Maximum Upload Size**: `5 MB` (enforced at both the multipart upload layer and validation layer)

### Representative Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": {
    "category": "plastic",
    "confidence": null,
    "itemDescription": "Crushed PET water bottle",
    "recyclable": true,
    "bin": {
      "name": "Blue Bin (Dry Recyclables)",
      "color": "#2563EB",
      "symbol": "♻️"
    },
    "disposalAdvice": "Empty liquids, rinse off food residue, crush/flatten the item, and place in the dry recycling bin.",
    "downstreamRoute": "Material Recovery Facility (MRF) -> Optical sorting -> Shredding & washing -> Extruded into recycled HDPE/PET pellets for remanufacturing.",
    "environmentalImpact": {
      "co2SavedKg": 0.082,
      "waterSavedLiters": 1.5,
      "landfillDivertedGrams": 30,
      "assumptions": "Baseline compares mechanical recycling of PET/HDPE against virgin polymer synthesis (EPA WARM model factor)."
    }
  }
}
```

> [!NOTE]
> **Honest Confidence Scores**: Generative LLM vision models (such as Gemini and Claude) generate descriptive content rather than calibrated statistical classifier probabilities. In accordance with honest AI practices, genuine vision providers return `confidence: null` (displayed as *"Confidence unavailable"* in the UI) rather than fabricating pseudo-random certainty percentages.

### Error Responses & HTTP Status Codes
All error responses adhere to a consistent error structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation."
  }
}
```

| HTTP Status | Error Code | Description / Trigger Condition |
|---|---|---|
| **400 Bad Request** | `INVALID_IMAGE` | No file attached in `image` field, empty buffer, or file header magic bytes do not match a valid JPEG, PNG, or WEBP image. |
| **400 Bad Request** | `INVALID_UPLOAD` | Upload processing failed or malformed multipart structure. |
| **413 Payload Too Large** | `FILE_TOO_LARGE` | Image size exceeds the 5 MB limit. |
| **415 Unsupported Media Type** | `INVALID_FILE_TYPE` | Uploaded file MIME type is unsupported (only JPEG, PNG, WEBP are accepted). |
| **422 Unprocessable Entity** | `NOT_WASTE` | Image successfully validated but does not depict recognizable waste or recyclable material. |
| **422 Unprocessable Entity** | `LOW_CONFIDENCE` | Calibrated model classification confidence fell below the required threshold (when a calibrated score is present). |
| **422 Unprocessable Entity** | `UNKNOWN_CATEGORY` | Vision model returned an unsupported or unrecognized waste classification category. |
| **502 Bad Gateway** | `INFERENCE_FAILED` | Upstream vision AI provider failed, timed out, or returned an unparseable response. |
| **503 Service Unavailable** | `PROVIDER_UNAVAILABLE` | No vision AI provider is configured, required API keys are missing, rate limits were hit, or mock mode was rejected in production. |
| **500 Internal Server Error** | `INTERNAL_SERVER_ERROR` | Unexpected server runtime exception (sanitized; internal stack traces and secrets are never exposed). |

---

## 🏷️ Canonical Waste Categories
1. `plastic` (Bottles, containers, wrap, HDPE, PET)
2. `paper` (Cardboard, paper sheets, envelopes, clean cartons)
3. `glass` (Bottles, jars, glassware)
4. `metal` (Aluminum soda cans, steel food tins, foil)
5. `organic` (Food leftovers, fruit peels, compostables)
6. `e_waste` (Batteries, cables, circuit boards, small electronics) — *`e-waste` alias automatically normalized!*
7. `general` (Sanitary items, multi-layer unrecyclable films, residual trash)
8. `unknown` (Unclassified or uncertain materials requiring physical inspection)

---

## 💻 How to Run the Backend Locally

### Prerequisites
- Node.js 20+
- MongoDB instance (local or MongoDB Atlas connection string)

### Steps
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `server/.env` (see Environment Variables section below).
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will bind to `http://localhost:5000` (or `PORT` from `.env`).
5. Run automated backend tests:
   ```bash
   npm test
   ```

---

## ⚙️ Environment Variables & Provider Configuration

### Configuration Table
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `CLIENT_ORIGIN` | Allowed CORS origin for frontend client | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/wastequest` |
| `WASTEQUEST_AI_PROVIDER` | Explicit AI provider selection: `gemini`, `anthropic`, or `mock` | Defaults to real configured provider |
| `AI_PROVIDER` | Fallback provider selection if `WASTEQUEST_AI_PROVIDER` is unset | Unset |
| `GEMINI_API_KEY` | Google Gemini API key | Unset |
| `GEMINI_MODEL` | Gemini vision model name | `gemini-1.5-flash` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Unset |
| `ANTHROPIC_MODEL` | Anthropic vision model name | `claude-3-5-sonnet-20241022` |
| `CONFIDENCE_THRESHOLD` | Minimum accepted confidence score (0.0 to 1.0) | `0.5` |
| `MAX_IMAGE_SIZE_MB` | Maximum accepted image size in MB | `5` |
| `NODE_ENV` | Runtime environment (`development`, `test`, `production`) | `development` |

### Genuine Vision AI vs Mock Mode (Strict Production Isolation)
- For **genuine image recognition**:
  ```env
  WASTEQUEST_AI_PROVIDER=gemini
  GEMINI_API_KEY=your_gemini_api_key_here
  GEMINI_MODEL=gemini-1.5-flash
  ```
  The system sends the actual image bytes to Google Gemini (or Anthropic Claude) and receives authentic categorization, grounded material descriptions, and item-specific disposal guidance.
- For **offline testing / CI**:
  ```env
  WASTEQUEST_AI_PROVIDER=mock
  ```
  Generates simulated responses for test execution without calling external vision services.
- If `NODE_ENV=production`, mock mode is strictly rejected with `503 PROVIDER_UNAVAILABLE`.
- **Never commit `.env` files or API credentials into source control.**

---

## 🧪 Verification & Test Results

### 1. AI Module Unit Tests (Node native runner)
```bash
cd ai
npm test
```
**Results**:
- **30 out of 30 tests passing (0 failures)**
- Verified:
  - Magic byte validation (`image/jpeg`, `image/png`, `image/webp`)
  - Corrupt header rejection (`INVALID_IMAGE`)
  - File size containment (> 5MB `FILE_TOO_LARGE`)
  - Non-waste rejection (`NOT_WASTE`)
  - Canonical category normalization (e.g., `e-waste` and `ewaste` $\rightarrow$ `e_waste`)
  - Gemini provider error handling: 401 Unauthorized, 429 Rate Limit, malformed responses (`INFERENCE_FAILED`, `PROVIDER_UNAVAILABLE`)
  - Mock mode isolation (rejected in `NODE_ENV=production`)

### 2. Automated AI Benchmark Suite
```bash
cd ai
npm run benchmark
```
**Results**:
- **7 / 7 test items evaluated with 100% accuracy**
- Sub-millisecond average execution time (0.10 ms local)

### 3. Backend Server Tests (Jest + Supertest)
```bash
cd server
npm test
```
**Results**:
- **33 out of 33 tests passing (4 out of 4 test suites passing)**
- Covered: `tests/classify.test.js`, `tests/reports.test.js`, `tests/leaderboard.test.js`, `tests/health.test.js`.
