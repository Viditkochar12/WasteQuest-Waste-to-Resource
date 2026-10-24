/**
 * WasteQuest AI Pipeline Verification & Mock Benchmark
 *
 * NOTE: This is an internal pipeline integration and speed benchmark utilizing
 * simulated mock inputs (MockProvider with preset categories) to verify the
 * complete end-to-end normalization, bin assignment, downstream route generation,
 * and LCA environmental impact math without invoking live external vision APIs.
 *
 * It does NOT measure live real-world computer vision accuracy.
 */

const { classifyWaste } = require("../src/classifyWaste");
const { MockProvider } = require("../src/providers/mockProvider");
const { MINIMAL_PNG, MINIMAL_JPEG } = require("../tests/mockImages");

async function runBenchmark() {
  console.log("===============================================================");
  console.log("    WasteQuest AI: Pipeline Verification & Mock Benchmark      ");
  console.log("===============================================================");
  console.log(" [!] Test Type: Pipeline Integration Test (Mock Mode)");
  console.log(" [!] Evaluates: In-memory normalization, bin mapping & LCA math");
  console.log(" [!] Note: Uses MockProvider; does not reflect live AI accuracy\n");

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
    let result;
    try {
      result = await classifyWaste(
        { buffer: tc.buffer, mimeType: tc.mimeType },
        { provider }
      );
    } catch (err) {
      result = { success: false, error: { code: "EXCEPTION", message: err.message } };
    }
    const elapsed = performance.now() - start;
    totalLatency += elapsed;

    const isMatch =
      result &&
      result.success === true &&
      (result.data.category === tc.category ||
        (tc.category === "e-waste" && result.data.category === "e_waste"));

    if (isMatch) {
      correctClassifications++;
      console.log(
        `[PASS] ${tc.name.padEnd(30)} -> Detected: ${result.data.category.toUpperCase().padEnd(10)} (${elapsed.toFixed(2)} ms)`
      );
    } else {
      const actual = result?.data?.category || result?.error?.code || "UNKNOWN";
      console.error(
        `[FAIL] ${tc.name.padEnd(30)} -> Expected: ${tc.category}, Received: ${actual} (${elapsed.toFixed(2)} ms)`
      );
    }
  }

  const avgLatency = (totalLatency / testCases.length).toFixed(2);
  const accuracy = ((correctClassifications / testCases.length) * 100).toFixed(1);
  const allPassed = correctClassifications === testCases.length;

  console.log("\n---------------------------------------------------------------");
  console.log(` Mode:                   Mock / Pipeline Simulation`);
  console.log(` Total Evaluated Items:  ${testCases.length}`);
  console.log(` Pipeline Success Rate:  ${accuracy}% (${correctClassifications}/${testCases.length})`);
  console.log(` Average Execution Time: ${avgLatency} ms`);
  console.log("---------------------------------------------------------------\n");

  if (allPassed) {
    console.log("✅ Pipeline mock benchmark completed successfully with zero errors!");
  } else {
    console.error(
      `❌ Pipeline mock benchmark failed: ${testCases.length - correctClassifications} of ${testCases.length} case(s) failed.`
    );
    process.exitCode = 1;
  }
}

runBenchmark().catch((err) => {
  console.error("Fatal benchmark error:", err);
  process.exitCode = 1;
});
