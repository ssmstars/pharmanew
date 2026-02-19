/**
 * PharmaGuard - Drug to Primary Gene Mapping
 * Maps pharmacogenetic drugs to their primary metabolizing genes
 * Based on CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines
 */

export const DrugGeneMap = {
  CODEINE: "CYP2D6",
  WARFARIN: "CYP2C9", 
  CLOPIDOGREL: "CYP2C19",
  SIMVASTATIN: "SLCO1B1",
  AZATHIOPRINE: "TPMT",
  FLUOROURACIL: "DPYD"
} as const;

// Type for supported drugs
export type SupportedDrug = keyof typeof DrugGeneMap;

// Type for supported genes
export type SupportedGene = typeof DrugGeneMap[SupportedDrug];

// Array of supported drugs for UI
export const SUPPORTED_DRUGS: SupportedDrug[] = Object.keys(DrugGeneMap) as SupportedDrug[];

// Array of supported genes for filtering
export const SUPPORTED_GENES: SupportedGene[] = [
  "CYP2D6",
  "CYP2C9", 
  "CYP2C19",
  "SLCO1B1",
  "TPMT",
  "DPYD"
];

/**
 * Get the primary gene for a given drug
 */
export function getPrimaryGene(drug: SupportedDrug): SupportedGene {
  return DrugGeneMap[drug];
}

/**
 * Check if a drug is supported
 */
export function isSupportedDrug(drug: string): drug is SupportedDrug {
  return drug in DrugGeneMap;
}

/**
 * Check if a gene is supported
 */
export function isSupportedGene(gene: string): gene is SupportedGene {
  return SUPPORTED_GENES.includes(gene as SupportedGene);
}