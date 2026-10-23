/**
 * Anthropic Claude Vision Provider using native Node fetch
 */

class AnthropicProvider {
  constructor(apiKey, model = "claude-3-5-sonnet-20241022") {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("ANTHROPIC_API_KEY is required for AnthropicProvider");
    }
    this.apiKey = apiKey.trim();
    this.model = model || "claude-3-5-sonnet-20241022";
    this.name = "anthropic";
  }

  async classify(buffer, mimeType) {
    const base64Data = buffer.toString("base64");
    const endpoint = "https://api.anthropic.com/v1/messages";

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
  "itemDescription": "<concise description of the item, e.g. 'aluminum soda can'>"
}
`;

    const requestBody = {
      model: this.model,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Data
              }
            },
            {
              type: "text",
              text: promptText
            }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Anthropic Vision API request failed with status ${response.status}`);
    }

    const json = await response.json();
    const rawContent = json.content?.[0]?.text;

    if (!rawContent) {
      throw new Error("Empty response received from Anthropic Vision model");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent.trim());
    } catch {
      const cleanJson = rawContent.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid response format received from Anthropic Vision model");
    }

    return {
      category: parsed.category,
      confidence: parsed.confidence,
      isWaste: parsed.isWaste !== undefined ? Boolean(parsed.isWaste) : true,
      itemDescription: parsed.itemDescription || "Identified waste item"
    };
  }
}

module.exports = { AnthropicProvider };
