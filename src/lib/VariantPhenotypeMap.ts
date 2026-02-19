/**
 * PharmaGuard - Variant to Phenotype Mapping
 * Maps star alleles to phenotypes for pharmacogenetic analysis
 * Based on CPIC guidelines and PharmGKB data
 */

export interface VariantInfo {
  rsID?: string;
  chromosome?: string;
  position?: number;
  ref?: string;
  alt?: string;
}

export interface Phenotype {
  name: string;
  activity: "Poor" | "Intermediate" | "Normal" | "Rapid" | "Ultrarapid";
  confidence: number; // 0-1
}

export interface GenotypeMapping {
  [diplotype: string]: Phenotype;
}

// CYP2D6 star allele to phenotype mapping
const CYP2D6_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.95 },
  "*1/*2": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.93 },
  "*1/*3": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.91 },
  "*1/*4": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.92 },
  "*1/*5": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.90 },
  "*1/*6": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.89 },
  "*2/*2": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.91 },
  "*3/*3": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 },
  "*3/*4": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.93 },
  "*4/*4": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.96 },
  "*4/*5": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.95 },
  "*5/*5": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 },
  "*1/*1xN": { name: "Ultrarapid Metabolizer", activity: "Ultrarapid", confidence: 0.88 },
  "*1/*2xN": { name: "Ultrarapid Metabolizer", activity: "Ultrarapid", confidence: 0.87 }
};

// CYP2C19 star allele to phenotype mapping
const CYP2C19_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.96 },
  "*1/*2": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.93 },
  "*1/*3": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.91 },
  "*1/*17": { name: "Rapid Metabolizer", activity: "Rapid", confidence: 0.89 },
  "*2/*2": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.95 },
  "*2/*3": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 },
  "*2/*17": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.90 },
  "*3/*3": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.93 },
  "*17/*17": { name: "Rapid Metabolizer", activity: "Rapid", confidence: 0.91 }
};

// CYP2C9 star allele to phenotype mapping
const CYP2C9_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.95 },
  "*1/*2": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.92 },
  "*1/*3": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.93 },
  "*2/*2": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.91 },
  "*2/*3": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.90 },
  "*3/*3": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 }
};

// SLCO1B1 variant to phenotype mapping
const SLCO1B1_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Function", activity: "Normal", confidence: 0.96 },
  "*1/*5": { name: "Decreased Function", activity: "Intermediate", confidence: 0.91 },
  "*1/*15": { name: "Decreased Function", activity: "Intermediate", confidence: 0.89 },
  "*5/*5": { name: "Poor Function", activity: "Poor", confidence: 0.93 },
  "*5/*15": { name: "Poor Function", activity: "Poor", confidence: 0.90 },
  "*15/*15": { name: "Poor Function", activity: "Poor", confidence: 0.88 }
};

// TPMT variant to phenotype mapping
const TPMT_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.96 },
  "*1/*2": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.92 },
  "*1/*3A": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.93 },
  "*1/*3C": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.91 },
  "*2/*3A": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 },
  "*3A/*3A": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.95 },
  "*3A/*3C": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.93 },
  "*3C/*3C": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.92 }
};

// DPYD variant to phenotype mapping
const DPYD_MAPPING: GenotypeMapping = {
  "*1/*1": { name: "Normal Metabolizer", activity: "Normal", confidence: 0.95 },
  "*1/*2A": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.91 },
  "*1/*13": { name: "Intermediate Metabolizer", activity: "Intermediate", confidence: 0.89 },
  "*2A/*2A": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.94 },
  "*2A/*13": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.92 },
  "*13/*13": { name: "Poor Metabolizer", activity: "Poor", confidence: 0.90 }
};

export const VariantPhenotypeMap = {
  CYP2D6: CYP2D6_MAPPING,
  CYP2C19: CYP2C19_MAPPING,
  CYP2C9: CYP2C9_MAPPING,
  SLCO1B1: SLCO1B1_MAPPING,
  TPMT: TPMT_MAPPING,
  DPYD: DPYD_MAPPING
} as const;

/**
 * Get phenotype for a gene and diplotype
 */
export function getPhenotype(gene: string, diplotype: string): Phenotype | null {
  const geneMapping = VariantPhenotypeMap[gene as keyof typeof VariantPhenotypeMap];
  if (!geneMapping) return null;
  
  return geneMapping[diplotype] || null;
}

/**
 * Construct diplotype from two alleles
 */
export function constructDiplotype(allele1: string, allele2: string): string {
  // Sort alleles for consistency (e.g., *1/*4 instead of *4/*1)
  const sorted = [allele1, allele2].sort();
  return `${sorted[0]}/${sorted[1]}`;
}

/**
 * Parse star allele from variant info
 * This is a simplified implementation for hackathon purposes
 */
export function parseStarAllele(gene: string, variantInfo: VariantInfo): string {
  // Simplified star allele inference based on rsID patterns
  // In production, this would use more sophisticated algorithms
  
  if (!variantInfo.rsID) return "*1"; // Default to wild-type
  
  const rsToStar: Record<string, Record<string, string>> = {
    "CYP2D6": {
      "rs3892097": "*4",
      "rs35742686": "*3",
      "rs5030655": "*6",
      "rs16947": "*2"
    },
    "CYP2C19": {
      "rs4244285": "*2",
      "rs4986893": "*3",
      "rs12248560": "*17"
    },
    "CYP2C9": {
      "rs1799853": "*2",
      "rs1057910": "*3"
    },
    "TPMT": {
      "rs1142345": "*3A",
      "rs1800460": "*3C",
      "rs1800462": "*2"
    }
  };

  const geneMapping = rsToStar[gene];
  if (geneMapping && variantInfo.rsID in geneMapping) {
    return geneMapping[variantInfo.rsID];
  }
  
  return "*1"; // Default to wild-type
}