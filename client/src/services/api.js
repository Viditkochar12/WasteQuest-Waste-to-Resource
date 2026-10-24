/**
 * WasteQuest API Client Service Layer
 * Centralized HTTP service that handles all network requests, error normalization,
 * AbortController signals, and optional dev-only mock modes.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const IS_MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === true;

// Default to '/api' (handled by Vite proxy in development) if VITE_API_BASE_URL is not set
if (!RAW_BASE_URL && !IS_MOCK_ENABLED) {
  console.info(
    "VITE_API_BASE_URL not set in client/.env; defaulting to '/api' (proxied by Vite to http://localhost:5000)."
  );
}

export const API_BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/+$/, "") : "/api";

/**
 * Universal safe fetch helper that guarantees { ok: true, data } | { ok: false, error }
 */
async function safeFetch(url, options = {}) {
  if (!API_BASE_URL && !IS_MOCK_ENABLED) {
    return {
      ok: false,
      error: {
        code: "CONFIG_ERROR",
        message: "API Base URL is not configured. Check client/.env settings.",
        status: 0
      }
    };
  }

  try {
    const response = await fetch(url, options);

    // Parse response body (safely handling non-JSON or HTML 500 pages)
    const contentType = response.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      try {
        body = await response.json();
      } catch {
        return {
          ok: false,
          error: {
            code: "PARSE_ERROR",
            message: "Server returned invalid JSON.",
            status: response.status
          }
        };
      }
    } else {
      const text = await response.text();
      return {
        ok: false,
        error: {
          code: response.ok ? "UNEXPECTED_RESPONSE" : `HTTP_${response.status}`,
          message: text.slice(0, 200) || `Server returned status ${response.status} (${response.statusText})`,
          status: response.status
        }
      };
    }

    // Check application-level success envelope
    if (!response.ok || (body && body.success === false)) {
      const errCode = body?.error?.code || `HTTP_${response.status}`;
      const errMessage = body?.error?.message || response.statusText || "Request failed";

      return {
        ok: false,
        error: {
          code: errCode,
          message: errMessage,
          status: response.status,
          details: body?.error?.details || null
        }
      };
    }

    return {
      ok: true,
      data: body.data !== undefined ? body.data : body,
      pagination: body.pagination || null,
      status: response.status
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        ok: false,
        error: {
          code: "REQUEST_ABORTED",
          message: "Request was cancelled by user or timed out.",
          status: 0
        }
      };
    }

    // Network offline, DNS failure, or CORS rejection
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          "Cannot reach the server. Please check your network connection, verify that the backend is running, and confirm CORS origin permissions.",
        status: 0,
        originalError: err.message
      }
    };
  }
}

/**
 * AI Waste Classification
 * Sends multipart/form-data with key 'image' to POST /api/classify
 */
export async function classifyImage(file, { signal, timeoutMs = 30000 } = {}) {
  if (!file) {
    return {
      ok: false,
      error: { code: "MISSING_FILE", message: "Please select an image to scan.", status: 400 }
    };
  }

  // Client validation: Size limit 5 MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `File size exceeds 5 MB limit (selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        status: 400
      }
    };
  }

  // Client validation: Allowed MIME types
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      ok: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: `Unsupported file format '${file.type || "unknown"}'. Only JPEG, PNG, and WebP are supported.`,
        status: 415
      }
    };
  }

  // Simulated mock fallback if explicit VITE_USE_MOCK=true is active
  if (IS_MOCK_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      ok: true,
      data: {
        category: "plastic",
        confidence: 0.94,
        itemDescription: "SIMULATED MOCK: Plastic drinking bottle",
        recyclable: true,
        disposalAdvice:
          "Rinse out liquids, flatten container, and discard in the blue dry-recyclables bin.",
        bin: {
          name: "Blue Bin (Dry Recyclables)",
          color: "#2563EB",
          symbol: "♻️"
        },
        downstreamRoute:
          "MRF optical sorting -> Shredded into PET flakes -> Repolymerized into recycled textile and food-grade packaging.",
        environmentalImpact: {
          co2SavedKg: 0.082,
          waterSavedLiters: 1.5,
          landfillDivertedGrams: 30
        },
        _isMock: true
      }
    };
  }

  // AbortController setup with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await safeFetch(`${API_BASE_URL}/classify`, {
      method: "POST",
      body: formData,
      signal: controller.signal
      // Note: NEVER set Content-Type header manually for multipart/form-data!
    });

    if (res.ok && res.data) {
      const { category, confidence } = res.data;
      if (!category) {
        return {
          ok: false,
          error: {
            code: "MALFORMED_RESPONSE",
            message: "Backend response missing waste category.",
            status: 200
          }
        };
      }
      let validConfidence = null;
      if (typeof confidence === "number" && !Number.isNaN(confidence)) {
        validConfidence = Math.max(0, Math.min(1, confidence));
      }
      res.data.confidence = validConfidence;
    }

    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * List Reports with pagination and optional filters
 * GET /api/reports?page=1&limit=10&category=...&status=...
 */
export async function getReports({ page, limit, category, status, signal } = {}) {
  if (IS_MOCK_ENABLED) {
    await new Promise((res) => setTimeout(res, 400));
    return {
      ok: true,
      data: [
        {
          _id: "mock-1",
          category: "plastic",
          confidence: 0.95,
          recyclable: true,
          disposalAdvice: "Rinse and place in dry recyclables bin.",
          createdAt: new Date().toISOString(),
          _isMock: true
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        totalReports: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }

  const query = new URLSearchParams();
  if (page !== undefined && page !== null) query.set("page", String(page));
  if (limit !== undefined && limit !== null) query.set("limit", String(limit));
  if (category) query.set("category", String(category));
  if (status) query.set("status", String(status));

  const queryString = query.toString();
  const url = `${API_BASE_URL}/reports${queryString ? `?${queryString}` : ""}`;

  return safeFetch(url, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json"
    }
  });
}

/**
 * Upload a report image to the backend Cloudinary integration.
 * POST /api/uploads with multipart field "image".
 */
export async function uploadReportImage(file, { signal } = {}) {
  if (!file) {
    return {
      ok: false,
      error: { code: "MISSING_FILE", message: "Please select an image to upload.", status: 400 }
    };
  }

  if (IS_MOCK_ENABLED) {
    return {
      ok: false,
      error: {
        code: "MOCK_UPLOAD_UNAVAILABLE",
        message: "Report image uploads are disabled in mock mode. Disable VITE_USE_MOCK and configure Cloudinary to save a real report.",
        status: 503
      }
    };
  }

  const formData = new FormData();
  formData.append("image", file);
  return safeFetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    body: formData,
    signal
  });
}

/**
 * Save / Create Report
 * POST /api/reports
 */
export async function createReport(reportPayload, { signal } = {}) {
  if (IS_MOCK_ENABLED) {
    await new Promise((res) => setTimeout(res, 500));
    return {
      ok: true,
      data: {
        _id: `mock-rep-${Date.now()}`,
        ...reportPayload,
        status: "pending",
        createdAt: new Date().toISOString(),
        _isMock: true
      }
    };
  }

  return safeFetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(reportPayload),
    signal
  });
}

/**
 * Fetch Leaderboard
 * GET /api/leaderboard
 */
export async function getLeaderboard({ signal } = {}) {
  if (IS_MOCK_ENABLED) {
    await new Promise((res) => setTimeout(res, 400));
    return {
      ok: true,
      data: [
        { rank: 1, name: "EcoPioneer_01", points: 840, itemsCount: 42, badge: "Gold Recycler" },
        { rank: 2, name: "ZeroWasteSam", points: 620, itemsCount: 31, badge: "Silver Sorter" },
        { rank: 3, name: "GreenCitizen", points: 490, itemsCount: 24, badge: "Bronze Guardian" }
      ]
    };
  }

  return safeFetch(`${API_BASE_URL}/leaderboard`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json"
    }
  });
}

/**
 * Get current user profile (if auth is enabled)
 * GET /api/users/me
 */
export async function getMe({ signal } = {}) {
  return safeFetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json"
    }
  });
}

/**
 * System Health Check
 * GET /api/health
 */
export async function getHealth({ signal } = {}) {
  return safeFetch(`${API_BASE_URL}/health`, {
    method: "GET",
    signal
  });
}
