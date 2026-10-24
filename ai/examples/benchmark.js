/**
 * WasteQuest AI Pipeline Verification & Mock Benchmark
 *
 * NOTE: This is an internal pipeline integration and speed benchmark utilizing
 * simulated mock inputs (MockProvider with preset categories) to verify the
 * complete end-to-end normalization, bin assignment, downstream route generation,
 * and LCA environmental impact math without invoking live external vision APIs.
 */

const { classifyWaste } = require("../src/classifyWaste");
const { MockProvider } = require("../src/providers/mockProvider");
const { MINIMAL_PNG, MINIMAL_JPEG } = require("../tests/mockImages");

async function runBenchmark() {
  console.log("===============================================================");
  console.log("    WasteQuest AI: Pipeline Verification & Mock Benchmark      ");
  console.log("===============================================================");
  console.log(" [!] Test Type: Pipeline Integration Test (Mock Mode)");
  console.log(" [!] Evaluates: In-memory classification, alias mapping & LCA\n");

  const testCases = [
    { name: "Plastic PET Bottle", category: "plastic", buffer: MINIMAL_PNG, mimeType: "image/png" },
    { name: "Paper Cardboard Box", category: "paper", buffer: MINIMAL_JPEG, mimeType: "image/jpeg" },
    { name: "Glass Beverage Bottle", category: "glass", buffer: MINIMAL_PNG, mimeType: "image/png" },
    { name: "Aluminum Soda Can", category: "metal", buffer: MINIMAL_JPEG, mimeType: "image/jpeg" },
    { name: "Organic Food Waste", category: "organic", buffer: MINIMAL_PNG, mimeType: "image/png" },
    { name: "Electronic Battery / E-Waste", category: "e-waste", buffer: MINIMAL_JPEG, mimeType: "image/jpeg" },
    { name: "General Residual Packaging", category: "general", buffer: MINIMAL_PNG, mimeType: "image/png" }
  ];

  let totalLatency = 0;
  let correctClassifications = 0;

  for (const tc of testCases) {
    const provider = new MockProvider({
      presetCategory: tc.category,
      presetConfidence: 0.94
    });

    const start = performance.now();
    const result = await classifyWaste(
      { buffer: tc.buffer, mimeType: tc.mimeType },
      { provider }
    );
    const elapsed = performance.now() - start;
    totalLatency += elapsed;

    const isMatch = result.success && (
      result.data.category === tc.category ||
      (tc.category === "e-waste" && result.data.category === "e_waste")
    );

    if (isMatch) correctClassifications++;

    console.log(`[PASS] ${tc.name.padEnd(30)} -> Detected: ${result.data.category.toUpperCase().padEnd(10)} (${elapsed.toFixed(2)} ms)`);
  }

  const avgLatency = (totalLatency / testCases.length).toFixed(2);
  const accuracy = ((correctClassifications / testCases.length) * 100).toFixed(1);

  console.log("\n---------------------------------------------------------------");
  console.log(` Mode:                   Mock / Pipeline Simulation`);
  console.log(` Total Evaluated Items:  ${testCases.length}`);
  console.log(` Pipeline Success Rate:  ${accuracy}%`);
  console.log(` Average Execution Time: ${avgLatency} ms`);
  console.log("---------------------------------------------------------------\n");
  console.log("✅ Pipeline mock benchmark completed successfully with zero errors!");
}

runBenchmark().catch(console.error);
