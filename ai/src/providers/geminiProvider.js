const { ErrorCodes, AIClassificationError } = require("../errors");

/**
 * Google Gemini Vision Provider using native Node fetch
 */
class GeminiProvider {
  constructor(apiKey, model = "gemini-3.5-flash-lite") {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new AIClassificationError(
        ErrorCodes.PROVIDER_UNAVAILABLE,
        "GEMINI_API_KEY is required for GeminiProvider."
      );
    }
    this.apiKey = apiKey.trim();
    this.model = model || "gemini-3.5-flash-lite";
    this.name = "gemini";
  }

  async classify(buffer, mimeType) {
    const base64Data = buffer.toString("base64");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${this.apiKey}`;

    const promptText = `
You are an expert waste classification computer vision model for the WasteQuest recycling application.
Analyze the provided image and classify the primary discarded/waste item into one of the following exact categories:
- plastic
- paper
- glass
- metal
- organic
- e_waste
- general
- unknown (use this if the waste material cannot be reliably identified or is uncertain)

Respond ONLY with a valid raw JSON object (no markdown, no backticks, no code block) matching this schema:
{
  "category": "plastic" | "paper" | "glass" | "metal" | "organic" | "e_waste" | "general" | "unknown",
  "isWaste": <boolean: false if the image does not show waste/recyclable items, e.g. human face, pet, living animal, natural landscape>,
  "itemDescription": "<concise description of the specific item detected, e.g. 'crushed PET water bottle' or 'banana peel'>",
  "disposalAdvice": "<brief disposal advice specific to this item and material>"
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000)
      });
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new AIClassificationError(
          ErrorCodes.INFERENCE_FAILED,
          "Gemini Vision API request timed out."
        );
      }
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Network connection to Gemini Vision API failed."
      );
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AIClassificationError(
          ErrorCodes.PROVIDER_UNAVAILABLE,
          "Gemini Vision API key is invalid or unauthorized."
        );
      }
      if (response.status === 429) {
        throw new AIClassificationError(
          ErrorCodes.PROVIDER_UNAVAILABLE,
          "Gemini Vision API rate limit exceeded. Please try again shortly."
        );
      }
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        `Gemini Vision API request failed with status ${response.status}.`
      );
    }

    let json;
    try {
      json = await response.json();
    } catch {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Malformed JSON response received from Gemini Vision API."
      );
    }

    const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Empty response received from Gemini Vision model."
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch {
      const cleanJson = rawContent.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        throw new AIClassificationError(
          ErrorCodes.INFERENCE_FAILED,
          "Failed to parse classification output from Gemini Vision model."
        );
      }
    }

    if (!parsed || typeof parsed !== "object") {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Invalid response format received from Gemini Vision model."
      );
    }

    return {
      category: parsed.category,
      confidence: null, // LLMs do not produce calibrated classification probabilities; honest null
      isWaste: parsed.isWaste !== undefined ? Boolean(parsed.isWaste) : true,
      itemDescription: parsed.itemDescription || "Identified waste item",
      disposalAdvice: parsed.disposalAdvice || null
    };
  }
}

module.exports = { GeminiProvider };
