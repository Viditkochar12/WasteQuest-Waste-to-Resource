# WasteQuest AI: Performance, Routing & LCA Impact Report

> **Track 06 — Sustainability & Climate Tech**  
> **Sub-track**: ST-01 | Waste to Resource  
> **Author**: Virendra Singh (AI & Sustainability Lead)  
> **Project**: WasteQuest — Waste to Resource

---

## 1. Executive Summary

The **WasteQuest AI Module** addresses the core challenge of post-consumer waste mismanagement: **incorrect segregation at the source**. By combining zero-shot and fine-tuned computer vision with real-time confidence scoring, prescriptive disposal advice, downstream circular routing, and Life Cycle Assessment (LCA) environmental accounting, WasteQuest converts unsegregated municipal solid waste into measurable recovered resources.

---

## 2. Waste Stream Categorization & Canonical Mapping

WasteQuest establishes a bounded taxonomy covering 7 canonical waste streams:

| Stream | Canonical Label | Destination Bin | Recyclability Status | Processing Target |
|---|---|---|---|---|
| **Plastics** | `plastic` | 🔵 Blue (Dry Recyclables) | Recyclable | PET / HDPE pelletizing & extrusion |
| **Paper & Cardboard** | `paper` | 🔵 Blue (Dry Recyclables) | Recyclable | Hydropulping & de-inking for newsprint/boxes |
| **Glass Containers** | `glass` | 🟢 Green (Glass Depots) | Recyclable | Cullet remelt (100% circular, zero degradation) |
| **Metals & Cans** | `metal` | 🔵 Blue (Metals & Cans) | Recyclable | Eddy-current sorting & smelter billets |
| **Organic & Food** | `organic` | 🟢 Green (Wet / Compost) | Recoverable | Anaerobic digestion / biogas & compost |
| **Electronic Waste** | `e_waste` | 🔴 Red (E-Waste Kiosk) | Recoverable | Manual dismantle & WEEE precious metal recovery |
| **Residual Trash** | `general` | ⚫ Grey / Black (Landfill) | Non-Recyclable | Waste-to-Energy (WTE) or engineered landfill |

*Note: Aliases such as `e-waste`, `cardboard`, `compost`, `plastics` are automatically normalized into canonical labels.*

---

## 3. Computer Vision Performance Benchmarks (Illustrative Pilot Benchmark)

> [!NOTE]
> **Methodology & Baseline Disclaimer**:  
> The metrics presented in this section represent an **illustrative pilot benchmark** synthesized from domain literature (TrashNet / TACO dataset transfer learning evaluations) and internal mock-pipeline integration tests. These figures serve as design targets and feasibility indicators for hackathon prototyping, not calibrated production field-sensor measurements.

### Illustrative Performance Across Test Benchmark (N = 350 Synthetic / Public Pilot Items)

| Waste Category | Precision (Target) | Recall (Target) | F1-Score | Mean Latency (Pipeline) | Primary Failure Mode |
|---|---|---|---|---|---|
| **Plastic** | 94.2% | 93.1% | 0.936 | 142 ms | Clear thin films / cling wrap |
| **Paper** | 96.0% | 95.4% | 0.957 | 138 ms | Heavily crumpled or soiled paper |
| **Glass** | 97.5% | 96.8% | 0.971 | 145 ms | Shattered translucent shards |
| **Metal** | 95.8% | 96.2% | 0.960 | 140 ms | Foil wrappers mistaken for plastic |
| **Organic** | 93.5% | 94.0% | 0.937 | 135 ms | Mixed leftover packaging |
| **E-Waste** | 98.1% | 97.2% | 0.976 | 149 ms | Obscured charging cables |
| **General** | 91.0% | 90.5% | 0.907 | 136 ms | Composite multi-layer plastics |
| **MACRO AVERAGE** | **95.2%** | **94.7%** | **0.949** | **140 ms** | — |

---

## 4. Illustrative Before & After Segregation Impact Projection

To address the hackathon requirement of **"Measure accuracy, contamination, recovery, or route efficiency against a baseline"**:

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

| Metric | Baseline (Unassisted) | With WasteQuest AI (Target) | Relative Improvement |
|---|---|---|---|
| **Segregation Accuracy** | 32.4% | **88.6%** | **+173% increase** |
| **Contamination Rate** | 41.2% | **6.8%** | **-83.5% reduction** |
| **Material Recovery Yield** | 28.0% | **84.3%** | **+201% recovery** |
| **E-Waste Diversion Rate** | 12.0% | **94.5%** | **+687% diversion** |

*Baseline references: Municipal Solid Waste characterization studies (World Bank "What a Waste 2.0") on unguided public source separation.*

---

## 5. Downstream Processing Routes (From Identification to Recovery)

1. **Plastic Route**:
   * *Step 1*: Detection & Guidance $\rightarrow$ Dry Recyclables Blue Bin.
   * *Step 2*: Material Recovery Facility (MRF) optical NIR sorting.
   * *Step 3*: Washing, label removal, and mechanical flaking.
   * *Step 4*: Extrusion into food-grade rPET or rHDPE pellets.
2. **Organic Route**:
   * *Step 1*: Detection & Guidance $\rightarrow$ Green Wet Waste Bin.
   * *Step 2*: Anaerobic digestion reactor (thermophilic at 55°C).
   * *Step 3*: Biogas extraction (60% methane) used for electricity generation.
   * *Step 4*: Digestate processed into organic N-P-K bio-fertilizer.
3. **E-Waste Route**:
   * *Step 1*: Isolation $\rightarrow$ Red / Grey hazardous collection kiosk.
   * *Step 2*: Manual disassembly, lithium-ion battery isolation.
   * *Step 3*: Circuit board depopulation and shredding.
   * *Step 4*: Smelter recovery for Gold, Silver, Copper, and rare earth elements.

---

## 6. Environmental Impact Calculation & Assumptions

As required by the **Boundaries and Safeguards** clause:

### Illustrative LCA Conversion Factors (Per Average Unit Item)
* **Plastic**: $0.082\text{ kg CO}_2\text{e}$ averted & $1.5\text{ L}$ water saved per typical 500ml PET bottle.
* **Paper**: $0.065\text{ kg CO}_2\text{e}$ averted & $3.2\text{ L}$ water saved per 50g cardboard container.
* **Glass**: $0.120\text{ kg CO}_2\text{e}$ averted & $0.4\text{ L}$ water saved per 200g glass bottle.
* **Metal (Aluminium)**: $0.175\text{ kg CO}_2\text{e}$ averted & $4.8\text{ L}$ water saved per 15g aluminum soda can.
* **Organic Waste**: $0.095\text{ kg CO}_2\text{e}$ averted per $120\text{g}$ food scrap.
* **E-Waste**: $0.350\text{ kg CO}_2\text{e}$ averted & $8.5\text{ L}$ water conserved per small consumer electronic item.

### Explicit Model Assumptions & Cited Literature
1. **LCA Baseline**: Emissions offsets are derived from the **EPA Waste Reduction Model (WARM v15)** factors and the **UK DEFRA Government GHG Conversion Factors for Company Reporting (Waste Disposal)**.
2. **Displacement Ratio**: Assumes $1\text{ kg}$ of recycled material displaces $0.85\text{ kg}$ of primary virgin material manufacturing.
3. **Methane Avoidance**: Composting and anaerobic digestion prevent anaerobic decomposition in landfill conditions, where methane has $28\times$ the Global Warming Potential (GWP) of $\text{CO}_2$ over a 100-year horizon (IPCC Sixth Assessment Report, AR6).
4. **Engineering Approximation**: Factors are generalized averages designed to provide real-time user feedback; they do not replace formal ISO 14040/14044 certified facility-level audits.
