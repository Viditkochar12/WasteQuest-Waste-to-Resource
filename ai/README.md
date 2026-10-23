# WasteQuest AI Classification Module

> **Track 06 — Sustainability & Climate Tech (ST-01 | Waste to Resource)**  
> Developed for the WasteQuest Team (Virendra · AI Lead)

---

## 🌟 Overview
The `ai/` module provides computer vision classification and intelligent segregation guidance for waste-to-resource recovery. It inspects images of discarded objects, categorizes them into standard waste streams, scores confidence, routes them to the proper color-coded bins, details downstream recovery pipelines, and calculates estimated environmental impact (CO2 & water savings).

---

## 🚀 Quick Start for Backend (Vidit)

### 1. Installation & Dependency
The module runs on **Node.js 20+** using native `fetch` and standard Node APIs. No external npm packages are required to run or test the AI module.

### 2. Express Route Integration Example
Add this directly to your Express server (e.g. `server/src/routes/classification.routes.js`):

```javascript
const express = require("express");
const multer = require("multer");
const path = require("path");
// Adjust relative path depending on your route file depth:
const { classifyWaste } = require("../../../ai/src/classifyWaste");

const router = express.Router();

// Configure Multer for in-memory buffer storage (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/classify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_FILE", message: "No image file provided in field 'image'" }
      });
    }

    const result = await classifyWaste({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype
    });

    if (!result.success) {
      const statusCode = result.error.code === "LOW_CONFIDENCE" ? 422 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    });
  }
});

module.exports = router;
```

---

## 📦 API Contract

### Input Format
```typescript
interface ClassificationInput {
  buffer: Buffer; // Raw image byte buffer
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}
```

### Output Response (`success: true`)
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

### Error Response (`success: false`)
```json
{
  "success": false,
  "error": {
    "code": "LOW_CONFIDENCE",
    "message": "Classification confidence (42.0%) is below the required threshold of 50.0%. Please take a clearer, closer photo."
  }
}
```

#### Error Codes:
- `MISSING_INPUT`: Missing buffer or MIME type.
- `INVALID_FILE_TYPE`: Unsupported image format (allowed: JPEG, PNG, WEBP).
- `FILE_TOO_LARGE`: Buffer exceeds size threshold (default 5MB).
- `INVALID_IMAGE`: Corrupt or truncated image header.
- `NOT_WASTE`: Image is not recognized as a waste or recyclable object (e.g., human faces, pets).
- `LOW_CONFIDENCE`: Model confidence fell below threshold.
- `INFERENCE_FAILED`: Vision API service error or connection drop.

---

## 🏷️ Canonical Waste Categories
1. `plastic` (Bottles, containers, wrap, HDPE, PET)
2. `paper` (Cardboard, paper sheets, envelopes, clean cartons)
3. `glass` (Bottles, jars, glassware)
4. `metal` (Aluminum soda cans, steel food tins, foil)
5. `organic` (Food leftovers, fruit peels, compostables)
6. `e_waste` (Batteries, cables, circuit boards, small electronics) — *`e-waste` alias automatically normalized!*
7. `general` (Sanitary items, multi-layer unrecyclable films, residual trash)

---

## ⚙️ Environment Variables

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `WASTEQUEST_AI_PROVIDER` | Preferred explicit provider selection: `gemini`, `anthropic`, or `mock` | Automatically selects a configured real provider |
| `AI_PROVIDER` | Alternative provider selection if `WASTEQUEST_AI_PROVIDER` is not set | Unset |
| `GEMINI_API_KEY` | Google Gemini API key | Unset |
| `GEMINI_MODEL` | Gemini vision model name | `gemini-1.5-flash` |
| `ANTHROPIC_API_KEY` | Anthropic API key | Unset |
| `ANTHROPIC_MODEL` | Anthropic vision model name | Configured provider default |
| `CONFIDENCE_THRESHOLD` | Minimum accepted confidence, from 0 to 1 | `0.5` |
| `MAX_IMAGE_SIZE_MB` | Maximum accepted image size in MB | `5` |
| `NODE_ENV` | Runtime environment; mock mode is rejected in production | Environment-dependent |

### Provider configuration

For real classification, configure a supported provider and its API key.

For local development or tests only, mock classification can be explicitly enabled using:

`WASTEQUEST_AI_PROVIDER=mock`

Mock mode must never be used in production. If no real provider is configured, the classifier returns `PROVIDER_UNAVAILABLE` rather than silently producing simulated results.

Never commit API keys or the local `.env` file.


## 🧪 Testing
```bash
# Run automated unit test suite
npm test

# Run live CLI demo
npm run demo
```
