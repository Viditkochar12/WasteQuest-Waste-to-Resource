# WasteQuest Frontend-to-Backend API Contract & Verification

This document specifies the exact API contract for the WasteQuest client, compares it against the active backend implementation (`server/src/`), highlights all discrepancies, and provides the architectural decisions implemented in the frontend.

---

## 1. Environment & Base Configuration

- **Base URL Environment Variable:** `VITE_API_BASE_URL`
- **Default Base URL:** `http://localhost:5000/api`
- **CORS Allowed Origin in Server (`server/src/app.js`):** `http://localhost:5173` (or `process.env.CLIENT_ORIGIN`)
- **JSON Body Parser Limit:** `100kb` (`server/src/app.js`)

---

## 2. Active Backend Route Audit (`server/src/`)

### Route: `GET /api/health`
- **Source:** `server/src/routes/health.routes.js`
- **Purpose:** Server and MongoDB connection health check
- **Success (DB connected):**
  - **HTTP Status:** `200 OK`
  - **Response Shape:**
    ```json
    {
      "success": true,
      "data": {
        "server": "ok",
        "database": "connected"
      }
    }
    ```
- **Error (DB disconnected):**
  - **HTTP Status:** `503 Service Unavailable`
  - **Response Shape:**
    ```json
    {
      "success": false,
      "data": {
        "server": "ok",
        "database": "disconnected"
      },
      "error": {
        "code": "DATABASE_UNAVAILABLE",
        "message": "The database is not connected."
      }
    }
    ```

---

### Route: `GET /api/reports`
- **Source:** `server/src/routes/reports.routes.js`
- **Purpose:** List recent waste classification reports with pagination and filtering
- **Supported Query Parameters:**
  - `page`: Positive integer (default: 1)
  - `limit`: Positive integer between 1 and 100 (default: 10)
  - `category`: String (optional filter, e.g. "plastic", "organic")
  - `status`: String (optional filter: "pending", "verified", or "rejected")
  - *Strict Validation:* Any unsupported query parameter returns HTTP 400 `INVALID_QUERY_PARAMETER`.
- **Success:**
  - **HTTP Status:** `200 OK`
  - **Response Shape:**
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "67195b00...",
          "category": "plastic",
          "confidence": 0.94,
          "image": {
            "url": "https://res.cloudinary.com/.../bottle.jpg",
            "publicId": "wastequest/bottle_123"
          },
          "location": {
            "latitude": 37.7749,
            "longitude": -122.4194
          },
          "disposalAdvice": "Empty liquids, rinse off food residue, crush/flatten the item, and place in the dry recycling bin.",
          "recyclable": true,
          "status": "pending",
          "createdAt": "2026-10-23T19:00:00.000Z",
          "updatedAt": "2026-10-23T19:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalReports": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
      }
    }
    ```

---

### Route: `POST /api/reports`
- **Source:** `server/src/routes/reports.routes.js`
- **Content-Type:** `application/json`
- **Request Body Fields:**
  - `category` (string, required, non-empty)
  - `confidence` (number, optional, range: `0 <= confidence <= 1`)
  - `image` (object, required)
    - `image.url` (string, required, non-empty)
    - `image.publicId` (string, required, non-empty)
  - `location` (object, required)
    - `location.latitude` (number, required, `-90 <= latitude <= 90`)
    - `location.longitude` (number, required, `-180 <= longitude <= 180`)
  - `disposalAdvice` (string, required, non-empty)
  - `recyclable` (boolean, required)
- **Success:**
  - **HTTP Status:** `201 Created`
  - **Response Shape:** `{ "success": true, "data": { ...savedReportDoc } }`
- **Validation Failure:**
  - **HTTP Status:** `400 Bad Request`
  - **Response Shape:**
    ```json
    {
      "success": false,
      "error": {
        "code": "INVALID_REPORT",
        "message": "Please provide valid report details."
      }
    }
    ```

---

### Route: `POST /api/classify` (AI Vision Classification)
- **Status in Active Backend:** **NOT MOUNTED YET IN Express `app.js`** (Returns `404 ROUTE_NOT_FOUND`).
- **Specification Source:** `ai/src/classifyWaste.js` (Merged into `main` via PR #7)
- **Agreed Contract Specification:**
  - **HTTP Method:** `POST`
  - **Endpoint:** `/api/classify`
  - **Content-Type:** `multipart/form-data`
  - **Field Name:** `image` (binary file)
  - **Allowed MIME Types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
  - **Maximum Size:** 5 MB (`5 * 1024 * 1024` bytes)
  - **Success Response (`200 OK`):**
    ```json
    {
      "success": true,
      "data": {
        "category": "plastic",
        "confidence": 0.94,
        "itemDescription": "Crushed PET water bottle",
        "recyclable": true,
        "bin": {
          "name": "Blue Bin (Dry Recyclables)",
          "color": "#2563EB",
          "symbol": "♻️"
        },
        "disposalAdvice": "Empty liquids, rinse off food residue, crush/flatten the item, and place in the dry recycling bin.",
        "downstreamRoute": "Material Recovery Facility (MRF) -> Optical sorting -> Shredding & washing -> Extruded into recycled HDPE/PET pellets for remanufacturing."
      }
    }
    ```
  - **Error Response (`400 Bad Request`, `415`, or `422 Unprocessable Entity`):**
    ```json
    {
      "success": false,
      "error": {
        "code": "LOW_CONFIDENCE | INVALID_FILE_TYPE | FILE_TOO_LARGE | INVALID_IMAGE | NOT_WASTE | MISSING_FILE",
        "message": "Descriptive error message"
      }
    }
    ```

---

### Proposed Route: `GET /api/leaderboard`
- **Status in Active Backend:** **NOT IMPLEMENTED YET** (Returns `404 ROUTE_NOT_FOUND`).
- **Client Handling:** Client renders a polite empty/pending state: *"Leaderboard not available yet (backend endpoint in progress)"* without breaking or crashing, and without generating synthetic fake rows.

---

### Proposed Route: `GET /api/users/me`
- **Status in Active Backend:** **NOT IMPLEMENTED YET** (Returns `404 ROUTE_NOT_FOUND`).

---

## 3. Discrepancies and Gap Analysis

| Feature / Route | Agreed Specification | Active Backend (`server/`) | Frontend Handling |
|---|---|---|---|
| `POST /api/classify` | AI image classification endpoint | Logic merged in `ai/`, but not mounted in `server/src/app.js` (404) | Client attempts real call; surfaces actual backend error code `ROUTE_NOT_FOUND`. Has explicit toggle `VITE_USE_MOCK=true` with prominent banner for local demonstration. |
| Report Image Upload | `POST /api/reports` requires `image.url` and `image.publicId` | Backend does not provide image cloud upload middleware (e.g. Cloudinary/S3) | Flagged in `docs/OPEN_QUESTIONS.md`. Client service accepts both modes: either classification returns uploaded image details, or client provides fallback preview ref. |
| Report Coordinates | `POST /api/reports` requires `location.latitude` & `longitude` | Required in Mongoose schema | Client requests standard browser Geolocation (HTML5 Geolocation API with user permission) when submitting a report, or provides graceful fallback coordinates. |
| `GET /api/leaderboard` | Returns ranked users and EcoPoints | Not implemented (404) | Client safely renders "Leaderboard not available yet" state, never fabricating mock leaderboard entries in production mode. |
| Pagination | Anticipated pagination query params (`page`, `limit`) | Fully implemented in `server/src/routes/reports.routes.js` | Client service passes clean query parameters and renders Previous/Next pagination controls. |
