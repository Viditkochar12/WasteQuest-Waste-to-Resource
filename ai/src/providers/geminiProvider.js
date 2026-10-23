/**
 * Google Gemini Vision Provider using native Node fetch
 */

class GeminiProvider {
  constructor(apiKey, model = "gemini-1.5-flash") {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required for GeminiProvider");
    }
    this.apiKey = apiKey;
    this.model = model;
    this.name = "gemini";
  }

  async classify(buffer, mimeType) {
    const base64Data = buffer.toString("base64");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errText}`);
    }

    const json = await response.json();
    const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Empty response received from Gemini Vision model");
    }

    try {
      const parsed = JSON.parse(rawContent.trim());
      return {
        category: parsed.category,
        confidence: Number(parsed.confidence) || 0.8,
        isWaste: parsed.isWaste !== undefined ? Boolean(parsed.isWaste) : true,
        itemDescription: parsed.itemDescription || "Identified waste item"
      };
    } catch {
      // Fallback in case JSON was wrapped in markdown blocks
      const cleanJson = rawContent.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return {
        category: parsed.category,
        confidence: Number(parsed.confidence) || 0.8,
        isWaste: parsed.isWaste !== undefined ? Boolean(parsed.isWaste) : true,
        itemDescription: parsed.itemDescription || "Identified waste item"
      };
    }
  }
}

module.exports = { GeminiProvider };
