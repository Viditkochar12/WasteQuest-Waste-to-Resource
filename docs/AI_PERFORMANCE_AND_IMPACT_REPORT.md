# WasteQuest AI: Performance, Routing & LCA Impact Report

> **Track 06 — Sustainability & Climate Tech**  
> **Sub-track**: ST-01 | Waste to Resource  
> **Author**: Virendra Singh (AI & Sustainability Lead)  
> **Project**: WasteQuest — Waste to Resource

---

## 1. Executive Summary

The **WasteQuest AI Module** addresses the core challenge of post-consumer waste mismanagement: **incorrect segregation at the point of disposal**. By combining multi-modal computer vision with real-time confidence verification, prescriptive sorting guidance, circular downstream routing, and Life Cycle Assessment (LCA) environmental impact estimation, WasteQuest bridges consumer behavior with circular economy recovery pipelines.

---

## 2. Waste Stream Categorization & Canonical Mapping

WasteQuest establishes a bounded taxonomy covering 7 canonical waste streams:

| Stream | Canonical Label | Destination Bin | Recyclability Status | Processing Target |
|---|---|---|---|---|
| **Plastics** | `plastic` | 🔵 Blue (Dry Recyclables) | Recyclable | PET / HDPE optical sorting, flaking & pelletizing |
| **Paper & Cardboard** | `paper` | 🔵 Blue (Dry Recyclables) | Recyclable | Hydropulping & de-inking for newsprint/cartons |
| **Glass Containers** | `glass` | 🟢 Green (Glass Depots) | Recyclable | Cullet beneficiation & infinite remelt (zero degradation) |
| **Metals & Cans** | `metal` | 🔵 Blue (Metals & Cans) | Recyclable | Eddy-current separation & secondary smelting billets |
| **Organic & Food** | `organic` | 🟢 Green (Wet / Compost) | Recoverable | Anaerobic digestion (biogas) & microbial composting |
| **Electronic Waste** | `e_waste` | 🔴 Red (E-Waste Kiosk) | Recoverable | Manual disassembly & WEEE precious metal recovery |
| **Residual Trash** | `general` | ⚫ Grey / Black (Landfill) | Non-Recyclable | Waste-to-Energy (WTE) incineration or sanitary landfill |

*Note: Aliases such as `e-waste`, `cardboard`, `compost`, `plastics` are automatically normalized into canonical labels.*

---

## 3. Performance & Evaluation: Measured vs. Theoretical Targets

> [!IMPORTANT]
> **Distinction Between Empirically Measured Pipeline Speed and Illustrative AI Targets**:
> - **Empirically Measured (In-Memory Mock Pipeline)**: Latency of **~0.20 ms per item** was measured locally on Node.js using the internal `ai/examples/benchmark.js` harness with `MockProvider`. This validates data structure serialization, alias resolution, and LCA mathematical calculation performance without network overhead.
> - **Illustrative Computer Vision Targets**: The precision and recall numbers tabulated below represent **theoretical system design targets** informed by published computer vision benchmarks on open waste datasets (TACO: Proença & Simões, 2020; TrashNet: Yang & Thung, 2016). They do **not** represent field-calibrated physical sensor measurements on a proprietary 350-item hardware dataset.

### Illustrative Design Targets (Synthetic / Literature Benchmark Baseline)

| Waste Category | Design Precision | Design Recall | Target F1-Score | Measured Pipeline Speed | Known Visual Challenge |
|---|---|---|---|---|---|
| **Plastic** | 94.2% | 93.1% | 0.936 | 0.20 ms | Transparent thin films, crumpled PET bottles |
| **Paper** | 96.0% | 95.4% | 0.957 | 0.06 ms | Grease-stained cardboard, shredded paper |
| **Glass** | 97.5% | 96.8% | 0.971 | 0.04 ms | Fractured translucent shards, dark amber glass |
| **Metal** | 95.8% | 96.2% | 0.960 | 0.03 ms | Metalized plastic pouches vs aluminum foil |
| **Organic** | 93.5% | 94.0% | 0.937 | 0.03 ms | Food scraps obscured inside takeout packaging |
| **E-Waste** | 98.1% | 97.2% | 0.976 | 0.03 ms | Tangled cables, unlabelled rechargeable batteries |
| **General** | 91.0% | 90.5% | 0.907 | 0.02 ms | Composite multi-material laminates |
| **MACRO AVERAGE** | **95.2%** | **94.7%** | **0.949** | **~0.20 ms** | — |

---

## 4. Illustrative Before & After Segregation Impact Projection

To address the hackathon prompt (**"Measure accuracy, contamination, recovery, or route efficiency against a baseline"**), the following model projects potential segregation improvements based on behavioral nudging literature:

```
                       Segregation Efficiency Comparison (Projected)
  100% ┌────────────────────────────────────────────────────────┐
       │                                            ████████ 88%│
   80% │                                            ████████    │
       │                        ████████ 45%        ████████    │
   60% │                        ████████            ████████    │
       │   ████████ 32%         ████████            ████████    │
       │   ████████             ████████            ████████    │
       │   ████████             ████████            ████████    │
   20% │   ████████             ████████            ████████    │
    0% └───┴────────────────────┴───────────────────┴───────────┘
        Baseline (Manual)   Static Signage     WasteQuest AI (Target)
```

### Projected Metrics Table

| Metric | Baseline (Unassisted) | With WasteQuest AI (Target) | Projected Improvement |
|---|---|---|---|
| **Segregation Accuracy** | 32.4% | **88.6%** | **+173% increase** |
| **Contamination Rate** | 41.2% | **6.8%** | **-83.5% reduction** |
| **Material Recovery Yield** | 28.0% | **84.3%** | **+201% recovery** |
| **E-Waste Diversion Rate** | 12.0% | **94.5%** | **+687% diversion** |

*Note: Baseline values are adapted from municipal solid waste characterization literature (e.g., World Bank "What a Waste 2.0", 2018; EPA Municipal Solid Waste Reports) evaluating public compliance under unguided disposal conditions.*

---

## 5. Downstream Processing Routes (From Identification to Recovery)

1. **Plastic Stream**:
   * *Segregation*: Blue Bin (Clean & dry recyclables).
   * *Downstream Route*: Material Recovery Facility (MRF) optical NIR sorting $\rightarrow$ Hot wash & decontamination $\rightarrow$ Flaking $\rightarrow$ Food-grade rPET/rHDPE pellet extrusion.
2. **Organic Stream**:
   * *Segregation*: Green Bin (Food residuals and compostable organic matter).
   * *Downstream Route*: Anaerobic digestion reactor (thermophilic 55°C) $\rightarrow$ Biogas capture (60% $\text{CH}_4$) for renewable electricity $\rightarrow$ Nutrient-rich digestate converted into organic bio-fertilizer.
3. **E-Waste Stream**:
   * *Segregation*: Red / Grey collection kiosk (Never mixed into municipal bins).
   * *Downstream Route*: Certified WEEE recycler $\rightarrow$ Manual battery and capacitor extraction $\rightarrow$ Shredding $\rightarrow$ Pyrometallurgical smelting for recovery of Gold, Silver, Copper, and rare earth metals.

---

## 6. Environmental Impact Calculation & Assumptions

As required by the **Boundaries and Safeguards** clause:

### Calculation Formula
$$\text{Emission Averted (kg CO}_2\text{e)} = \text{Estimated Item Mass (kg)} \times \text{Material Emission Factor (kg CO}_2\text{e / kg)}$$

### Factor Breakdown & Literature Substantiation

| Material | Assumed Unit Mass | Factor Source | CO2e Averted / Item | Water Saved / Item |
|---|---|---|---|---|
| **Plastic (PET bottle)** | ~0.030 kg | EPA WARM v15 (Recycled PET vs Virgin) | **0.082 kg** | **1.5 L** |
| **Paper (Cardboard packaging)** | ~0.050 kg | EPA WARM v15 (Corrugated Containers) | **0.065 kg** | **3.2 L** |
| **Glass (Container bottle)** | ~0.200 kg | EPA WARM v15 (Recycled Cullet) | **0.120 kg** | **0.4 L** |
| **Metal (Aluminium can)** | ~0.015 kg | EPA WARM v15 (Recycled Ingot vs Bauxite) | **0.175 kg** | **4.8 L** |
| **Organic (Food scraps)** | ~0.120 kg | EPA WARM v15 (Methane Avoidance via Compost) | **0.095 kg** | **0.0 L** |
| **E-Waste (Small peripheral)** | ~0.080 kg | WEEE Forum LCA (Precious Metal Recovery) | **0.350 kg** *(heuristic)* | **8.5 L** *(heuristic)* |

### Explicit Model Assumptions & Caveats
1. **LCA Baseline**: Emission offsets are derived from the **EPA Waste Reduction Model (WARM v15)** factors and the **UK DEFRA Government GHG Conversion Factors for Company Reporting**.
2. **Displacement Ratio**: Assumes $1\text{ kg}$ of recycled material displaces $0.85\text{ kg}$ of primary virgin material manufacturing.
3. **Methane Avoidance Factor**: Composting and anaerobic digestion prevent anaerobic decomposition in landfill conditions, where methane has a Global Warming Potential (GWP) 28 times greater than $\text{CO}_2$ over a 100-year horizon (IPCC AR6).
4. **E-Waste Heuristic Note**: Electronic waste embodies heterogeneous multi-material assemblies; the figures provided are illustrative order-of-magnitude estimates intended for user gamification and education, not certified ISO 14040/14044 facility audits.
