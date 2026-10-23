/**
 * Quick demonstration of WasteQuest AI Classification
 * Run via: npm run demo
 */

const { classifyWaste } = require("../src/classifyWaste");
const { MINIMAL_PNG } = require("../tests/mockImages");

async function runDemo() {
  console.log("==================================================");
  console.log("       WasteQuest AI Classification Demo          ");
  console.log("==================================================\n");

  console.log("[1] Testing classification on simulated waste image...");

  const result = await classifyWaste({
    buffer: MINIMAL_PNG,
    mimeType: "image/png"
  });

  console.log("\nClassification Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    console.log("\n--------------------------------------------------");
    console.log(` Category:        ${result.data.category.toUpperCase()}`);
    console.log(` Confidence:      ${(result.data.confidence * 100).toFixed(1)}%`);
    console.log(` Recyclable:      ${result.data.recyclable ? "YES ✅" : "NO ❌"}`);
    console.log(` Assigned Bin:    ${result.data.bin.name}`);
    console.log(` Disposal Advice: ${result.data.disposalAdvice}`);
    console.log(` Downstream:      ${result.data.downstreamRoute}`);
    console.log(` CO2 Diverted:    ${result.data.environmentalImpact.co2SavedKg} kg CO2e`);
    console.log(` Water Saved:     ${result.data.environmentalImpact.waterSavedLiters} L`);
    console.log("--------------------------------------------------\n");
    console.log("✅ Classification completed successfully!");
  } else {
    console.error("❌ Classification failed:", result.error);
  }
}

runDemo().catch(console.error);
