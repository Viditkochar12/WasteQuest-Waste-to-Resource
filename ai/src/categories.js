/**
 * Waste Categories, Downstream Routing, and Environmental Impact Metadata
 * Aligned with Hackathon Track ST-01: Waste to Resource
 */

const CANONICAL_CATEGORIES = {
  plastic: "plastic",
  paper: "paper",
  glass: "glass",
  metal: "metal",
  organic: "organic",
  e_waste: "e_waste",
  general: "general"
};

// Aliases mapping (e.g. e-waste -> e_waste)
const CATEGORY_ALIASES = {
  "e-waste": "e_waste",
  "ewaste": "e_waste",
  "electronic_waste": "e_waste",
  "plastics": "plastic",
  "papers": "paper",
  "cardboard": "paper",
  "glasses": "glass",
  "metals": "metal",
  "food": "organic",
  "compost": "organic",
  "residual": "general",
  "trash": "general",
  "landfill": "general"
};

/**
 * Metadata for each canonical waste stream
 */
const WASTE_GUIDELINES = {
  [CANONICAL_CATEGORIES.plastic]: {
    recyclable: true,
    bin: {
      name: "Blue Bin (Dry Recyclables)",
      color: "#2563EB",
      symbol: "♻️"
    },
    downstreamRoute: "Material Recovery Facility (MRF) -> Optical sorting -> Shredding & washing -> Extruded into recycled HDPE/PET pellets for remanufacturing.",
    disposalAdvice: "Empty liquids, rinse off food residue, crush/flatten the item, and place in the dry recycling bin.",
    environmentalImpact: {
      co2SavedKg: 0.082, // ~0.082 kg CO2e saved per typical 500ml plastic container recycled vs virgin PET production
      waterSavedLiters: 1.5,
      landfillDivertedGrams: 30,
      assumptions: "Baseline compares mechanical recycling of PET/HDPE against virgin polymer synthesis and incineration/landfilling (EPA WARM model factor: ~1.5-2.0 kg CO2e per kg recycled plastic)."
    }
  },

  [CANONICAL_CATEGORIES.paper]: {
    recyclable: true,
    bin: {
      name: "Blue Bin (Paper & Cardboard)",
      color: "#2563EB",
      symbol: "📄"
    },
    downstreamRoute: "Paper mill -> Hydropulping (de-inking) -> Screening -> Repulped into recycled cardboard and newsprint.",
    disposalAdvice: "Keep clean and dry. Flatten cardboard boxes. Do not recycle paper soaked in oil or food grease.",
    environmentalImpact: {
      co2SavedKg: 0.065, // ~0.065 kg CO2e per average paper item (newspaper/box)
      waterSavedLiters: 3.2,
      landfillDivertedGrams: 50,
      assumptions: "Recycled pulp saves ~40% energy and up to 50% water compared to virgin tree harvesting and kraft pulping."
    }
  },

  [CANONICAL_CATEGORIES.glass]: {
    recyclable: true,
    bin: {
      name: "Green Bin (Glass Recyclables)",
      color: "#059669",
      symbol: "🍾"
    },
    downstreamRoute: "Glass beneficiation plant -> Crushed into cullet -> Melted at 1500°C -> Molded infinitely into new glass jars and bottles without loss of purity.",
    disposalAdvice: "Remove lids/corks, rinse clean, avoid breaking, and place into dedicated glass recycling bin.",
    environmentalImpact: {
      co2SavedKg: 0.120, // ~0.12 kg CO2e saved per glass bottle recycled vs sand mining & raw furnace melting
      waterSavedLiters: 0.4,
      landfillDivertedGrams: 200,
      assumptions: "Every 10% cullet used in furnace reduces energy usage by 3% and CO2 emissions by 5%."
    }
  },

  [CANONICAL_CATEGORIES.metal]: {
    recyclable: true,
    bin: {
      name: "Blue Bin (Metals & Cans)",
      color: "#2563EB",
      symbol: "🥫"
    },
    downstreamRoute: "Scrap processing facility -> Magnetic/Eddy current separation -> Shredding -> Smelting into recycled aluminum ingots or steel billets.",
    disposalAdvice: "Empty and lightly rinse drink cans or food tins. Labels are acceptable. Avoid compressing aerosol cans without depressurization.",
    environmentalImpact: {
      co2SavedKg: 0.175, // Recycling aluminum saves 95% of the energy needed for bauxite ore smelting
      waterSavedLiters: 4.8,
      landfillDivertedGrams: 45,
      assumptions: "Recycled aluminum avoids ~9 kg CO2 per kg raw material compared to primary bauxite smelting."
    }
  },

  [CANONICAL_CATEGORIES.organic]: {
    recyclable: true, // Compostable / Recoverable as biogas
    bin: {
      name: "Green Bin (Wet / Organic Waste)",
      color: "#16A34A",
      symbol: "🍏"
    },
    downstreamRoute: "Industrial composting facility or Anaerobic Digestion plant -> Microbial decomposition -> Methane capture for biogas + Nutrient-rich bio-fertilizer.",
    disposalAdvice: "Keep separate from plastic packaging. Suitable for fruit/vegetable peels, coffee grounds, and food leftovers.",
    environmentalImpact: {
      co2SavedKg: 0.095, // Prevents anaerobic methane release in landfills (methane has 28x GWP of CO2)
      waterSavedLiters: 0.0,
      landfillDivertedGrams: 120,
      assumptions: "Diverting wet organic waste from landfills directly mitigates methane (CH4) generation through controlled composting or biogas recovery."
    }
  },

  [CANONICAL_CATEGORIES.e_waste]: {
    recyclable: true,
    bin: {
      name: "Red / Grey E-Waste Depot",
      color: "#DC2626",
      symbol: "🔋"
    },
    downstreamRoute: "Certified WEEE recycler -> Manual disassembly -> Battery/hazardous extraction -> PCB shredding -> Precious metal pyrometallurgical recovery (Au, Ag, Cu).",
    disposalAdvice: "Do not throw into household bins! Tape battery terminals if exposed. Drop off at an authorized e-waste collection center or kiosk.",
    environmentalImpact: {
      co2SavedKg: 0.350,
      waterSavedLiters: 8.5,
      landfillDivertedGrams: 80,
      assumptions: "Prevents heavy metal leaching (lead, mercury, cadmium) into groundwater and recovers critical rare-earth elements."
    }
  },

  [CANONICAL_CATEGORIES.general]: {
    recyclable: false,
    bin: {
      name: "Black / Grey Bin (Landfill / Non-Recyclable)",
      color: "#4B5563",
      symbol: "🗑️"
    },
    downstreamRoute: "Waste-to-Energy (WTE) incineration plant or engineered sanitary landfill with leachate management.",
    disposalAdvice: "Used for multi-layer unrecyclable packaging, hygiene products, or heavily contaminated items. Dispose of tightly sealed.",
    environmentalImpact: {
      co2SavedKg: 0.0,
      waterSavedLiters: 0.0,
      landfillDivertedGrams: 0,
      assumptions: "Item destined for municipal residual processing or sanitary landfill."
    }
  }
};

/**
 * Normalizes input label into standard canonical category
 */
function normalizeCategory(label) {
  if (!label || typeof label !== "string") return CANONICAL_CATEGORIES.general;
  const cleaned = label.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (CANONICAL_CATEGORIES[cleaned]) {
    return CANONICAL_CATEGORIES[cleaned];
  }

  // Check aliases
  if (CATEGORY_ALIASES[cleaned]) {
    return CATEGORY_ALIASES[cleaned];
  }

  // Direct alias check without underscore
  const rawCleaned = label.trim().toLowerCase();
  if (CATEGORY_ALIASES[rawCleaned]) {
    return CATEGORY_ALIASES[rawCleaned];
  }

  return CANONICAL_CATEGORIES.general;
}

/**
 * Retrieves guidelines and environmental impact for a category
 */
function getGuidanceForCategory(category) {
  const canonical = normalizeCategory(category);
  return {
    canonicalCategory: canonical,
    ...WASTE_GUIDELINES[canonical]
  };
}

module.exports = {
  CANONICAL_CATEGORIES,
  CATEGORY_ALIASES,
  WASTE_GUIDELINES,
  normalizeCategory,
  getGuidanceForCategory
};
