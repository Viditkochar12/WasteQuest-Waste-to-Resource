const { ErrorCodes, AIClassificationError } = require("../errors");

/**
 * Anthropic Claude Vision Provider using native Node fetch
 */
class AnthropicProvider {
  constructor(apiKey, model = "claude-3-5-sonnet-20241022") {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new AIClassificationError(
        ErrorCodes.PROVIDER_UNAVAILABLE,
        "ANTHROPIC_API_KEY is required for AnthropicProvider."
      );
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
- unknown (use this if the waste material cannot be reliably identified or is uncertain)

Respond ONLY with a valid raw JSON object (no markdown, no backticks, no code block) matching this schema:
{
  "category": "plastic" | "paper" | "glass" | "metal" | "organic" | "e_waste" | "general" | "unknown",
  "isWaste": <boolean: false if the image does not show waste/recyclable items, e.g. human face, pet, living animal, natural landscape>,
  "itemDescription": "<concise description of the specific item detected, e.g. 'aluminum soda can' or 'apple core'>",
  "disposalAdvice": "<brief disposal advice specific to this item and material>"
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

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000)
      });
    } catch (err) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        throw new AIClassificationError(
          ErrorCodes.INFERENCE_FAILED,
          "Anthropic Vision API request timed out."
        );
      }
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Network connection to Anthropic Vision API failed."
      );
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AIClassificationError(
          ErrorCodes.PROVIDER_UNAVAILABLE,
          "Anthropic Vision API key is invalid or unauthorized."
        );
      }
      if (response.status === 429) {
        throw new AIClassificationError(
          ErrorCodes.PROVIDER_UNAVAILABLE,
          "Anthropic Vision API rate limit exceeded. Please try again shortly."
        );
      }
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        `Anthropic Vision API request failed with status ${response.status}.`
      );
    }

    let json;
    try {
      json = await response.json();
    } catch {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Malformed JSON response received from Anthropic Vision API."
      );
    }

    const rawContent = json.content?.[0]?.text;

    if (!rawContent) {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Empty response received from Anthropic Vision model."
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
          "Failed to parse classification output from Anthropic Vision model."
        );
      }
    }

    if (!parsed || typeof parsed !== "object") {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Invalid response format received from Anthropic Vision model."
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

module.exports = { AnthropicProvider };
