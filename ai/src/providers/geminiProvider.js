/**
 * Google Gemini Vision Provider using native Node fetch
 */

class GeminiProvider {
  constructor(apiKey, model = "gemini-1.5-flash") {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("GEMINI_API_KEY is required for GeminiProvider");
    }
    this.apiKey = apiKey.trim();
    this.model = model || "gemini-1.5-flash";
    this.name = "gemini";
  }

  async classify(buffer, mimeType) {
    const base64Data = buffer.toString("base64");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;

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

Respond ONLY with a valid raw JSON object (no markdown, no backticks, no code block) matching this schema:
{
  "category": "plastic" | "paper" | "glass" | "metal" | "organic" | "e_waste" | "general",
  "confidence": <float between 0.0 and 1.0>,
  "isWaste": <boolean: false if the image does not show waste/recyclable items, e.g. human face, pet, nature landscape>,
  "itemDescription": "<concise description of the item, e.g. 'crushed PET water bottle'>"
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API request failed with status ${response.status}`);
    }

    const json = await response.json();
    const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Empty response received from Gemini Vision model");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch {
      // Fallback in case JSON was wrapped in markdown blocks
      const cleanJson = rawContent.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid response format received from Gemini Vision model");
    }

    return {
      category: parsed.category,
      confidence: parsed.confidence,
      isWaste: parsed.isWaste !== undefined ? Boolean(parsed.isWaste) : true,
      itemDescription: parsed.itemDescription || "Identified waste item"
    };
  }
}

module.exports = { GeminiProvider };
