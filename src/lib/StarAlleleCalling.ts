/**
 * PharmaGuard - Star Allele Calling Engine
 * Scientifically accurate star allele calling based on CPIC guidelines
 * 
 * Key principle: One star allele per chromosome (diploid = 2 alleles)
 * Activity Score model follows CPIC 2023 guidelines
 */

import { VCFVariant } from './VCFParser';

// ==================== TYPE DEFINITIONS ====================

export interface StarAlleleDefinition {
  allele: string;
  definingVariants: string[];  // rsIDs that define this allele
  function: 'normal' | 'decreased' | 'no_function' | 'increased';
  activityScore: number;
  clinicalFunction: string;
}

export interface GeneStarAlleleConfig {
  gene: string;
  referenceAllele: string;  // Usually *1
  alleleDefinitions: StarAlleleDefinition[];
  rsToAlleleMap: Record<string, string>;  // Quick lookup: rsID -> star allele
  phasingMethod: 'rule_based_haplotype_inference' | 'statistical' | 'read_backed';
}

export interface DiplotypeResult {
  diplotype: string;
  allele1: string;
  allele2: string;
  activityScore: number;
  phenotype: string;
  confidenceScore: number;
  detectedVariants: DetectedVariant[];
  phasingMethod: string;
  guidelineSource: string;
}

export interface DetectedVariant {
  rsid: string;
  genotype: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  gene: string;
  starAlleleImpact: string;
  functionImpact: string;
}

// ==================== STAR ALLELE DEFINITIONS ====================

/**
 * CYP2D6 Star Allele Configuration
 * Based on CPIC 2023 CYP2D6-Codeine Guideline
 */
export const CYP2D6_CONFIG: GeneStarAlleleConfig = {
  gene: 'CYP2D6',
  referenceAllele: '*1',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*2', definingVariants: ['rs16947'], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*3', definingVariants: ['rs35742686'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*4', definingVariants: ['rs3892097'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*5', definingVariants: [], function: 'no_function', activityScore: 0, clinicalFunction: 'Gene deletion' },
    { allele: '*6', definingVariants: ['rs5030655'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*9', definingVariants: ['rs5030656'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*10', definingVariants: ['rs1065852'], function: 'decreased', activityScore: 0.25, clinicalFunction: 'Decreased function' },
    { allele: '*17', definingVariants: ['rs28371706'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*29', definingVariants: ['rs59421388'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*41', definingVariants: ['rs28371725'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' }
  ],
  rsToAlleleMap: {
    'rs16947': '*2',
    'rs35742686': '*3',
    'rs3892097': '*4',
    'rs5030655': '*6',
    'rs5030656': '*9',
    'rs1065852': '*10',
    'rs28371706': '*17',
    'rs59421388': '*29',
    'rs28371725': '*41'
  }
};

/**
 * CYP2C19 Star Allele Configuration
 */
export const CYP2C19_CONFIG: GeneStarAlleleConfig = {
  gene: 'CYP2C19',
  referenceAllele: '*1',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*2', definingVariants: ['rs4244285'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*3', definingVariants: ['rs4986893'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*4', definingVariants: ['rs28399504'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*6', definingVariants: ['rs56337013'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*9', definingVariants: ['rs17884712'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*17', definingVariants: ['rs12248560', 'rs12769205'], function: 'increased', activityScore: 1.5, clinicalFunction: 'Increased function' }
  ],
  rsToAlleleMap: {
    'rs4244285': '*2',
    'rs4986893': '*3',
    'rs28399504': '*4',
    'rs56337013': '*6',
    'rs17884712': '*9',
    'rs12248560': '*17',
    'rs12769205': '*17'
  }
};

/**
 * CYP2C9 Star Allele Configuration
 * Updated with complete alleles per CPIC 2017 Warfarin Guideline
 */
export const CYP2C9_CONFIG: GeneStarAlleleConfig = {
  gene: 'CYP2C9',
  referenceAllele: '*1',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*2', definingVariants: ['rs1799853'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*3', definingVariants: ['rs1057910'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*5', definingVariants: ['rs28371686'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*6', definingVariants: ['rs9332131'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*8', definingVariants: ['rs7900194'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*11', definingVariants: ['rs28371685'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*12', definingVariants: ['rs9332239'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' }
  ],
  rsToAlleleMap: {
    'rs1799853': '*2',
    'rs1057910': '*3',
    'rs28371686': '*5',
    'rs9332131': '*6',
    'rs7900194': '*8',
    'rs28371685': '*11',
    'rs9332239': '*12'
  }
};

/**
 * TPMT Star Allele Configuration
 */
export const TPMT_CONFIG: GeneStarAlleleConfig = {
  gene: 'TPMT',
  referenceAllele: '*1',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*2', definingVariants: ['rs1800462'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*3A', definingVariants: ['rs1800460', 'rs1142345'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*3B', definingVariants: ['rs1800460'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*3C', definingVariants: ['rs1142345'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' }
  ],
  rsToAlleleMap: {
    'rs1800462': '*2',
    'rs1800460': '*3B',
    'rs1142345': '*3C'
  }
};

/**
 * DPYD Star Allele Configuration
 */
export const DPYD_CONFIG: GeneStarAlleleConfig = {
  gene: 'DPYD',
  referenceAllele: '*1',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*2A', definingVariants: ['rs3918290'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' },
    { allele: '*13', definingVariants: ['rs55886062'], function: 'no_function', activityScore: 0, clinicalFunction: 'No function' }
  ],
  rsToAlleleMap: {
    'rs3918290': '*2A',
    'rs55886062': '*13'
  }
};

/**
 * SLCO1B1 Star Allele Configuration
 */
export const SLCO1B1_CONFIG: GeneStarAlleleConfig = {
  gene: 'SLCO1B1',
  referenceAllele: '*1a',
  phasingMethod: 'rule_based_haplotype_inference',
  alleleDefinitions: [
    { allele: '*1a', definingVariants: [], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*1b', definingVariants: ['rs2306283'], function: 'normal', activityScore: 1.0, clinicalFunction: 'Normal function' },
    { allele: '*5', definingVariants: ['rs4149056'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' },
    { allele: '*15', definingVariants: ['rs2306283', 'rs4149056'], function: 'decreased', activityScore: 0.5, clinicalFunction: 'Decreased function' }
  ],
  rsToAlleleMap: {
    'rs4149056': '*5',
    'rs2306283': '*1b'
  }
};

// ==================== SNP-BASED GENE CONFIGURATIONS ====================

/**
 * SNP-based gene result interface for genes like VKORC1 and CYP4F2
 * that don't use star allele nomenclature
 */
export interface SNPGeneResult {
  gene: string;
  rsid: string;
  genotype: string;
  genotypeDisplay: string;  // e.g., "G/A" instead of "0/1"
  clinicalEffect: string;
  doseModifier: string;
  detectedVariant: DetectedVariant | null;
}

/**
 * VKORC1 Configuration
 * Critical for warfarin sensitivity - rs9923231 (-1639G>A)
 */
export const VKORC1_RSID = 'rs9923231';
export const VKORC1_SNP_CONFIG = {
  gene: 'VKORC1',
  rsid: 'rs9923231',
  chromosome: '16',
  position: 31096368,
  ref: 'G',
  alt: 'A',
  interpretations: {
    'GG': { genotypeDisplay: 'G/G', effect: 'Normal warfarin sensitivity', doseModifier: 'Standard dose', sensitivity: 'Normal' },
    'GA': { genotypeDisplay: 'G/A', effect: 'Increased warfarin sensitivity', doseModifier: 'Reduce initial dose by ~25%', sensitivity: 'Intermediate' },
    'AG': { genotypeDisplay: 'G/A', effect: 'Increased warfarin sensitivity', doseModifier: 'Reduce initial dose by ~25%', sensitivity: 'Intermediate' },
    'AA': { genotypeDisplay: 'A/A', effect: 'High warfarin sensitivity', doseModifier: 'Reduce initial dose by ~50%', sensitivity: 'High' },
    '0/0': { genotypeDisplay: 'G/G', effect: 'Normal warfarin sensitivity (ref)', doseModifier: 'Standard dose', sensitivity: 'Normal' },
    '0/1': { genotypeDisplay: 'G/A', effect: 'Increased warfarin sensitivity', doseModifier: 'Reduce initial dose by ~25%', sensitivity: 'Intermediate' },
    '1/0': { genotypeDisplay: 'G/A', effect: 'Increased warfarin sensitivity', doseModifier: 'Reduce initial dose by ~25%', sensitivity: 'Intermediate' },
    '1/1': { genotypeDisplay: 'A/A', effect: 'High warfarin sensitivity', doseModifier: 'Reduce initial dose by ~50%', sensitivity: 'High' }
  }
};

/**
 * CYP4F2 Configuration
 * Affects vitamin K metabolism - rs2108622 (*3, V433M)
 */
export const CYP4F2_RSID = 'rs2108622';
export const CYP4F2_SNP_CONFIG = {
  gene: 'CYP4F2',
  rsid: 'rs2108622',
  chromosome: '19',
  position: 15990431,
  ref: 'C',
  alt: 'T',
  interpretations: {
    'CC': { genotypeDisplay: 'C/C', effect: 'Normal vitamin K metabolism', doseModifier: 'No adjustment', starAllele: '*1/*1' },
    'CT': { genotypeDisplay: 'C/T', effect: 'Slightly reduced vitamin K metabolism', doseModifier: 'May need ~5-10% higher dose', starAllele: '*1/*3' },
    'TC': { genotypeDisplay: 'C/T', effect: 'Slightly reduced vitamin K metabolism', doseModifier: 'May need ~5-10% higher dose', starAllele: '*1/*3' },
    'TT': { genotypeDisplay: 'T/T', effect: 'Reduced vitamin K metabolism', doseModifier: 'May need ~10-15% higher dose', starAllele: '*3/*3' },
    '0/0': { genotypeDisplay: 'C/C', effect: 'Normal vitamin K metabolism (ref)', doseModifier: 'No adjustment', starAllele: '*1/*1' },
    '0/1': { genotypeDisplay: 'C/T', effect: 'Slightly reduced vitamin K metabolism', doseModifier: 'May need ~5-10% higher dose', starAllele: '*1/*3' },
    '1/0': { genotypeDisplay: 'C/T', effect: 'Slightly reduced vitamin K metabolism', doseModifier: 'May need ~5-10% higher dose', starAllele: '*1/*3' },
    '1/1': { genotypeDisplay: 'T/T', effect: 'Reduced vitamin K metabolism', doseModifier: 'May need ~10-15% higher dose', starAllele: '*3/*3' }
  }
};

// Gene config registry
export const GENE_CONFIGS: Record<string, GeneStarAlleleConfig> = {
  'CYP2D6': CYP2D6_CONFIG,
  'CYP2C19': CYP2C19_CONFIG,
  'CYP2C9': CYP2C9_CONFIG,
  'TPMT': TPMT_CONFIG,
  'DPYD': DPYD_CONFIG,
  'SLCO1B1': SLCO1B1_CONFIG
};

// ==================== STAR ALLELE CALLING ENGINE ====================

export class StarAlleleCaller {
  
  /**
   * Call diplotype from VCF variants for a specific gene
   * CRITICAL: Only considers variants where genotype ≠ 0/0
   */
  static callDiplotype(gene: string, variants: VCFVariant[]): DiplotypeResult {
    const config = GENE_CONFIGS[gene];
    
    if (!config) {
      return this.createUnknownResult(gene, variants);
    }

    // Step 1: Filter variants for this gene with non-reference genotypes
    const geneVariants = this.filterGeneVariants(gene, variants, config);
    
    // Step 2: Identify star alleles from detected variants
    const detectedAlleles = this.identifyStarAlleles(geneVariants, config);
    
    // Step 3: Assign diplotype (one allele per chromosome)
    const { allele1, allele2 } = this.assignDiplotype(detectedAlleles, config);
    
    // Step 4: Calculate activity score
    const activityScore = this.calculateActivityScore(allele1, allele2, config);
    
    // Step 5: Determine phenotype from activity score
    const phenotype = this.activityScoreToPhenotype(gene, activityScore);
    
    // Step 6: Build detected variants list (only non-0/0)
    const detectedVariantsList = this.buildDetectedVariantsList(geneVariants, config);

    // Step 7: Calculate confidence score
    const confidenceScore = this.calculateConfidence(geneVariants, detectedAlleles);

    const diplotype = this.formatDiplotype(allele1, allele2);

    return {
      diplotype,
      allele1,
      allele2,
      activityScore,
      phenotype,
      confidenceScore,
      detectedVariants: detectedVariantsList,
      phasingMethod: config.phasingMethod,
      guidelineSource: this.getGuidelineSource(gene)
    };
  }

  /**
   * Filter variants for a specific gene with non-reference genotypes
   */
  private static filterGeneVariants(
    gene: string, 
    variants: VCFVariant[], 
    config: GeneStarAlleleConfig
  ): Array<VCFVariant & { genotype: string }> {
    const relevantRsIDs = Object.keys(config.rsToAlleleMap);
    const filteredVariants: Array<VCFVariant & { genotype: string }> = [];

    for (const variant of variants) {
      // Check if this variant is relevant for this gene
      // Match by rsID (from the ID column or INFO field) OR by gene annotation
      const hasRelevantRsID = variant.rsID && relevantRsIDs.includes(variant.rsID);
      const hasGeneMatch = variant.gene === gene;
      
      // Skip if neither rsID nor gene matches
      if (!hasRelevantRsID && !hasGeneMatch) {
        continue;
      }

      // Extract genotype from samples or info
      const genotype = this.extractGenotype(variant);
      
      // CRITICAL: Only include variants where genotype ≠ 0/0
      if (genotype && genotype !== '0/0' && genotype !== '0|0') {
        filteredVariants.push({ ...variant, genotype });
      }
    }

    return filteredVariants;
  }

  /**
   * Extract genotype from variant
   */
  private static extractGenotype(variant: VCFVariant): string | null {
    // Check samples array first (standard VCF format)
    if (variant.samples && variant.samples.length > 0) {
      const sampleData = variant.samples[0];
      // Genotype is typically the first field
      const gt = sampleData.split(':')[0];
      return gt;
    }

    // Check INFO field
    if (variant.info?.GT) {
      return variant.info.GT;
    }

    // Check for genotype in a GT field
    if (variant.info?.GENOTYPE) {
      return variant.info.GENOTYPE;
    }

    return null;
  }

  /**
   * Identify star alleles from detected variants
   */
  private static identifyStarAlleles(
    variants: Array<VCFVariant & { genotype: string }>,
    config: GeneStarAlleleConfig
  ): { allele: string; zygosity: 'heterozygous' | 'homozygous'; rsID: string }[] {
    const detectedAlleles: { allele: string; zygosity: 'heterozygous' | 'homozygous'; rsID: string }[] = [];

    for (const variant of variants) {
      if (!variant.rsID) continue;

      const starAllele = config.rsToAlleleMap[variant.rsID];
      if (!starAllele) continue;

      // Determine zygosity from genotype
      const zygosity = this.determineZygosity(variant.genotype);
      
      detectedAlleles.push({
        allele: starAllele,
        zygosity,
        rsID: variant.rsID
      });
    }

    return detectedAlleles;
  }

  /**
   * Determine zygosity from genotype string
   */
  private static determineZygosity(genotype: string): 'heterozygous' | 'homozygous' {
    // Handle both / and | separators
    const alleles = genotype.split(/[\/|]/);
    
    if (alleles.length !== 2) return 'heterozygous';
    
    // 0/1 or 1/0 = heterozygous, 1/1 = homozygous
    if (alleles[0] === alleles[1]) {
      return 'homozygous';
    }
    return 'heterozygous';
  }

  /**
   * Assign diplotype from detected alleles
   * Each person has 2 chromosomes, so max 2 alleles
   */
  private static assignDiplotype(
    detectedAlleles: { allele: string; zygosity: 'heterozygous' | 'homozygous'; rsID: string }[],
    config: GeneStarAlleleConfig
  ): { allele1: string; allele2: string } {
    // No variants detected = reference/reference
    if (detectedAlleles.length === 0) {
      return { allele1: config.referenceAllele, allele2: config.referenceAllele };
    }

    // Check for homozygous variants first
    const homozygous = detectedAlleles.find(a => a.zygosity === 'homozygous');
    if (homozygous) {
      return { allele1: homozygous.allele, allele2: homozygous.allele };
    }

    // Heterozygous variants
    if (detectedAlleles.length === 1) {
      // One variant heterozygous = variant/reference
      return { allele1: config.referenceAllele, allele2: detectedAlleles[0].allele };
    }

    // Multiple heterozygous variants - use first two unique alleles
    // In real implementation, would need proper phasing
    const uniqueAlleles = [...new Set(detectedAlleles.map(a => a.allele))];
    
    if (uniqueAlleles.length === 1) {
      // Same allele from different variants (compound heterozygous markers)
      return { allele1: config.referenceAllele, allele2: uniqueAlleles[0] };
    }

    // Two different alleles
    return { allele1: uniqueAlleles[0], allele2: uniqueAlleles[1] };
  }

  /**
   * Calculate activity score from diplotype
   * Based on CPIC Activity Score model
   */
  private static calculateActivityScore(
    allele1: string,
    allele2: string,
    config: GeneStarAlleleConfig
  ): number {
    const getAlleleScore = (allele: string): number => {
      const def = config.alleleDefinitions.find(d => d.allele === allele);
      return def ? def.activityScore : 1.0; // Default to normal if not found
    };

    return getAlleleScore(allele1) + getAlleleScore(allele2);
  }

  /**
   * Convert activity score to phenotype
   * Based on CPIC phenotype assignment tables
   */
  private static activityScoreToPhenotype(gene: string, activityScore: number): string {
    // CYP2D6 activity score to phenotype (CPIC 2023)
    if (gene === 'CYP2D6') {
      if (activityScore === 0) return 'PM';
      if (activityScore > 0 && activityScore < 1.25) return 'IM';
      if (activityScore >= 1.25 && activityScore <= 2.25) return 'NM';
      if (activityScore > 2.25) return 'URM';
    }

    // CYP2C9 activity score to phenotype (CPIC 2017 Warfarin Guideline)
    // 2 = NM, 1-1.5 = IM, 0-0.5 = PM
    if (gene === 'CYP2C9') {
      if (activityScore === 0 || activityScore <= 0.5) return 'PM';
      if (activityScore > 0.5 && activityScore <= 1.5) return 'IM';
      if (activityScore >= 2) return 'NM';
      return 'IM'; // Default to IM for scores between 1.5-2
    }

    // CYP2C19 activity score to phenotype
    if (gene === 'CYP2C19') {
      if (activityScore === 0) return 'PM';
      if (activityScore > 0 && activityScore < 1.5) return 'IM';
      if (activityScore >= 1.5 && activityScore <= 2) return 'NM';
      if (activityScore > 2) return 'RM';
      if (activityScore > 2.5) return 'URM';
    }

    // Default activity score interpretation
    if (activityScore === 0) return 'PM';
    if (activityScore < 1) return 'IM';
    if (activityScore <= 2) return 'NM';
    return 'URM';
  }

  /**
   * Build list of detected variants with impact annotations
   */
  private static buildDetectedVariantsList(
    variants: Array<VCFVariant & { genotype: string }>,
    config: GeneStarAlleleConfig
  ): DetectedVariant[] {
    return variants.map(v => {
      const starAllele = v.rsID ? config.rsToAlleleMap[v.rsID] : undefined;
      const alleleDef = starAllele ? 
        config.alleleDefinitions.find(d => d.allele === starAllele) : undefined;

      return {
        rsid: v.rsID || `${v.chromosome}:${v.position}`,
        genotype: v.genotype,
        chromosome: v.chromosome,
        position: v.position,
        ref: v.ref,
        alt: v.alt,
        gene: config.gene,
        starAlleleImpact: starAllele || 'Unknown',
        functionImpact: alleleDef?.clinicalFunction || 'Unknown'
      };
    });
  }

  /**
   * Calculate confidence score for the diplotype call
   */
  private static calculateConfidence(
    variants: Array<VCFVariant & { genotype: string }>,
    detectedAlleles: { allele: string; zygosity: 'heterozygous' | 'homozygous'; rsID: string }[]
  ): number {
    let confidence = 0.7; // Base confidence

    // Bonus for each detected variant
    confidence += Math.min(variants.length * 0.05, 0.15);

    // Bonus for consistent allele calls
    if (detectedAlleles.length > 0) {
      confidence += 0.1;
    }

    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Format diplotype string (sorted for consistency)
   */
  private static formatDiplotype(allele1: string, allele2: string): string {
    const sorted = [allele1, allele2].sort((a, b) => {
      // Extract numeric part for proper sorting
      const numA = parseInt(a.replace(/[^\d]/g, '')) || 0;
      const numB = parseInt(b.replace(/[^\d]/g, '')) || 0;
      return numA - numB;
    });
    return `${sorted[0]}/${sorted[1]}`;
  }

  /**
   * Get guideline source for a gene
   */
  private static getGuidelineSource(gene: string): string {
    const sources: Record<string, string> = {
      'CYP2D6': 'CPIC Guideline for CYP2D6 and Codeine Therapy (2023 Update)',
      'CYP2C19': 'CPIC Guideline for CYP2C19 and Clopidogrel Therapy (2022 Update)',
      'CYP2C9': 'CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (2017 Update)',
      'TPMT': 'CPIC Guideline for Thiopurines and TPMT/NUDT15 (2018 Update)',
      'DPYD': 'CPIC Guideline for Fluoropyrimidines and DPYD (2017 Update)',
      'SLCO1B1': 'CPIC Guideline for SLCO1B1 and Statin-Associated Musculoskeletal Symptoms (2022 Update)'
    };
    return sources[gene] || 'CPIC Guidelines';
  }

  /**
   * Create unknown result for unsupported genes
   */
  private static createUnknownResult(gene: string, variants: VCFVariant[]): DiplotypeResult {
    return {
      diplotype: 'Unknown',
      allele1: 'Unknown',
      allele2: 'Unknown',
      activityScore: -1,
      phenotype: 'Unknown',
      confidenceScore: 0.3,
      detectedVariants: [],
      phasingMethod: 'none',
      guidelineSource: 'Not available'
    };
  }

  /**
   * Get activity score interpretation text
   */
  static getActivityScoreInterpretation(gene: string, activityScore: number, phenotype: string): string {
    if (gene === 'CYP2D6') {
      if (activityScore === 0) {
        return 'Activity Score 0 indicates no CYP2D6 enzyme activity. Codeine will not be converted to morphine, resulting in no analgesic effect.';
      }
      if (activityScore < 1.25) {
        return `Activity Score ${activityScore.toFixed(1)} indicates reduced CYP2D6 enzyme activity. Codeine conversion to morphine is decreased, potentially resulting in reduced analgesic effect.`;
      }
      if (activityScore <= 2.25) {
        return `Activity Score ${activityScore.toFixed(1)} indicates normal CYP2D6 enzyme activity. Standard codeine metabolism expected.`;
      }
      return `Activity Score ${activityScore.toFixed(1)} indicates increased CYP2D6 enzyme activity. Rapid conversion of codeine to morphine may increase risk of toxicity.`;
    }
    
    if (gene === 'CYP2C9') {
      if (activityScore === 0) {
        return 'Activity Score 0 indicates no CYP2C9 enzyme activity. Significantly reduced warfarin metabolism expected.';
      }
      if (activityScore <= 1) {
        return `Activity Score ${activityScore.toFixed(1)} indicates poor CYP2C9 enzyme activity. Substantially reduced warfarin clearance expected.`;
      }
      if (activityScore <= 1.5) {
        return `Activity Score ${activityScore.toFixed(1)} indicates intermediate CYP2C9 enzyme activity. Moderately reduced warfarin clearance expected.`;
      }
      return `Activity Score ${activityScore.toFixed(1)} indicates normal CYP2C9 enzyme activity. Standard warfarin metabolism expected.`;
    }
    
    return `Activity Score ${activityScore.toFixed(1)} corresponds to ${phenotype} status.`;
  }

  // ==================== SNP-BASED GENE CALLING ====================

  /**
   * Call SNP-based gene result (for VKORC1, CYP4F2)
   */
  static callSNPGene(
    gene: 'VKORC1' | 'CYP4F2',
    variants: VCFVariant[]
  ): SNPGeneResult {
    const config = gene === 'VKORC1' ? VKORC1_SNP_CONFIG : CYP4F2_SNP_CONFIG;
    
    // Find the relevant variant by rsID
    const variant = variants.find(v => v.rsID === config.rsid);
    
    if (!variant) {
      // No variant found - assume reference genotype
      const refInterpretation = config.interpretations['0/0'];
      return {
        gene: config.gene,
        rsid: config.rsid,
        genotype: '0/0',
        genotypeDisplay: refInterpretation.genotypeDisplay,
        clinicalEffect: refInterpretation.effect,
        doseModifier: refInterpretation.doseModifier,
        detectedVariant: null
      };
    }

    // Extract genotype
    let genotype = '0/0';
    if (variant.samples && variant.samples.length > 0) {
      const sampleData = variant.samples[0];
      genotype = sampleData.split(':')[0];
    }

    // Only include if genotype ≠ 0/0
    if (genotype === '0/0' || genotype === '0|0') {
      const refInterpretation = config.interpretations['0/0'];
      return {
        gene: config.gene,
        rsid: config.rsid,
        genotype: '0/0',
        genotypeDisplay: refInterpretation.genotypeDisplay,
        clinicalEffect: refInterpretation.effect,
        doseModifier: refInterpretation.doseModifier,
        detectedVariant: null
      };
    }

    const interpretations = config.interpretations as Record<string, { genotypeDisplay: string; effect: string; doseModifier: string }>;
    const interpretation = interpretations[genotype] || interpretations['0/0'];
    
    return {
      gene: config.gene,
      rsid: config.rsid,
      genotype: genotype,
      genotypeDisplay: interpretation.genotypeDisplay,
      clinicalEffect: interpretation.effect,
      doseModifier: interpretation.doseModifier,
      detectedVariant: {
        rsid: config.rsid,
        genotype: genotype,
        chromosome: variant.chromosome,
        position: variant.position,
        ref: variant.ref,
        alt: variant.alt,
        gene: config.gene,
        starAlleleImpact: 'N/A',
        functionImpact: interpretation.effect
      }
    };
  }

  // ==================== MULTI-GENE WARFARIN ANALYSIS ====================

  /**
   * Comprehensive multi-gene warfarin analysis
   * Includes CYP2C9, VKORC1, and CYP4F2
   */
  static callWarfarinMultiGene(variants: VCFVariant[]): WarfarinMultiGeneResult {
    // Call each gene
    const cyp2c9Result = this.callDiplotype('CYP2C9', variants);
    const vkorc1Result = this.callSNPGene('VKORC1', variants);
    const cyp4f2Result = this.callSNPGene('CYP4F2', variants);

    // Determine phenotype labels
    const cyp2c9Phenotype = this.getPhenotypeLabel(cyp2c9Result.phenotype);
    
    // Calculate recommended dose adjustment
    const doseRecommendation = this.calculateWarfarinDoseRecommendation(
      cyp2c9Result.activityScore,
      vkorc1Result.genotype,
      cyp4f2Result.genotype
    );

    // Validate consistency
    const validationErrors = this.validateWarfarinConsistency(cyp2c9Result);

    // Collect all detected variants
    const allDetectedVariants: DetectedVariant[] = [
      ...cyp2c9Result.detectedVariants
    ];
    if (vkorc1Result.detectedVariant) {
      allDetectedVariants.push(vkorc1Result.detectedVariant);
    }
    if (cyp4f2Result.detectedVariant) {
      allDetectedVariants.push(cyp4f2Result.detectedVariant);
    }

    return {
      drug: 'WARFARIN',
      analysisType: 'multi_gene',
      genes: {
        CYP2C9: {
          diplotype: cyp2c9Result.diplotype,
          activityScore: cyp2c9Result.activityScore,
          phenotypeCode: cyp2c9Result.phenotype,
          phenotypeLabel: cyp2c9Phenotype,
          detectedVariants: cyp2c9Result.detectedVariants
        },
        VKORC1: {
          rsid: vkorc1Result.rsid,
          genotype: vkorc1Result.genotype,
          genotypeDisplay: vkorc1Result.genotypeDisplay,
          sensitivity: this.getVKORC1Sensitivity(vkorc1Result.genotype),
          clinicalEffect: vkorc1Result.clinicalEffect,
          doseModifier: vkorc1Result.doseModifier,
          detectedVariant: vkorc1Result.detectedVariant
        },
        CYP4F2: {
          rsid: cyp4f2Result.rsid,
          genotype: cyp4f2Result.genotype,
          genotypeDisplay: cyp4f2Result.genotypeDisplay,
          clinicalEffect: cyp4f2Result.clinicalEffect,
          doseModifier: cyp4f2Result.doseModifier,
          detectedVariant: cyp4f2Result.detectedVariant
        }
      },
      overallRisk: this.calculateWarfarinOverallRisk(cyp2c9Result, vkorc1Result),
      doseRecommendation,
      allDetectedVariants,
      totalVariantsDetected: allDetectedVariants.length,
      validationErrors,
      guidelineSource: 'CPIC Guideline for Pharmacogenetics-Guided Warfarin Dosing (2017 Update)',
      cpicLevel: 'A'
    };
  }

  /**
   * Get phenotype label from code
   */
  private static getPhenotypeLabel(phenotypeCode: string): string {
    const labels: Record<string, string> = {
      'PM': 'Poor Metabolizer',
      'IM': 'Intermediate Metabolizer',
      'NM': 'Normal Metabolizer',
      'RM': 'Rapid Metabolizer',
      'URM': 'Ultrarapid Metabolizer',
      'Unknown': 'Unknown'
    };
    return labels[phenotypeCode] || phenotypeCode;
  }

  /**
   * Get VKORC1 sensitivity level from genotype
   */
  private static getVKORC1Sensitivity(genotype: string): string {
    if (genotype === '1/1' || genotype === 'AA') return 'High sensitivity';
    if (genotype === '0/1' || genotype === '1/0' || genotype === 'GA' || genotype === 'AG') return 'Intermediate sensitivity';
    return 'Normal sensitivity';
  }

  /**
   * Calculate warfarin dose recommendation based on all genes
   */
  private static calculateWarfarinDoseRecommendation(
    cyp2c9ActivityScore: number,
    vkorc1Genotype: string,
    cyp4f2Genotype: string
  ): WarfarinDoseRecommendation {
    // Base dose reduction from CYP2C9
    let doseReductionPercent = 0;
    if (cyp2c9ActivityScore <= 0.5) {
      doseReductionPercent = 60; // PM
    } else if (cyp2c9ActivityScore <= 1.5) {
      doseReductionPercent = 25; // IM
    }

    // VKORC1 adjustment
    let vkorc1Adjustment = '';
    if (vkorc1Genotype === '1/1') {
      doseReductionPercent += 50;
      vkorc1Adjustment = 'High VKORC1 sensitivity (AA) - reduce dose significantly';
    } else if (vkorc1Genotype === '0/1' || vkorc1Genotype === '1/0') {
      doseReductionPercent += 25;
      vkorc1Adjustment = 'Intermediate VKORC1 sensitivity (GA) - reduce dose moderately';
    }

    // CYP4F2 adjustment (increases dose need)
    let cyp4f2Adjustment = '';
    if (cyp4f2Genotype === '1/1') {
      doseReductionPercent -= 10;
      cyp4f2Adjustment = 'CYP4F2 *3/*3 - may need slightly higher dose';
    } else if (cyp4f2Genotype === '0/1' || cyp4f2Genotype === '1/0') {
      doseReductionPercent -= 5;
      cyp4f2Adjustment = 'CYP4F2 *1/*3 - minor dose increase may be needed';
    }

    // Cap reduction at 80%
    doseReductionPercent = Math.min(doseReductionPercent, 80);
    doseReductionPercent = Math.max(doseReductionPercent, 0);

    let strategy = 'Standard initial dosing';
    if (doseReductionPercent >= 50) {
      strategy = `Start at 50-60% below standard dose (significant reduction required)`;
    } else if (doseReductionPercent >= 25) {
      strategy = `Start at 20-30% below standard dose`;
    } else if (doseReductionPercent > 0) {
      strategy = `Start at 10-20% below standard dose`;
    }

    return {
      initialDoseStrategy: strategy,
      doseReductionPercent,
      adjustments: [
        vkorc1Adjustment,
        cyp4f2Adjustment
      ].filter(a => a.length > 0),
      monitoring: [
        'Frequent INR monitoring during initiation (every 2-3 days)',
        'Adjust dose based on INR response',
        'Consider CPIC-based dosing algorithm'
      ]
    };
  }

  /**
   * Calculate overall warfarin risk level
   */
  private static calculateWarfarinOverallRisk(
    cyp2c9Result: DiplotypeResult,
    vkorc1Result: SNPGeneResult
  ): 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' {
    const cyp2c9PM = cyp2c9Result.activityScore <= 0.5;
    const cyp2c9IM = cyp2c9Result.activityScore <= 1.5 && !cyp2c9PM;
    const vkorc1Sensitive = vkorc1Result.genotype === '1/1' || vkorc1Result.genotype === '0/1' || vkorc1Result.genotype === '1/0';

    if (cyp2c9PM && vkorc1Sensitive) return 'SEVERE';
    if (cyp2c9PM || (cyp2c9IM && vkorc1Sensitive)) return 'HIGH';
    if (cyp2c9IM || vkorc1Sensitive) return 'MODERATE';
    return 'LOW';
  }

  // ==================== CONSISTENCY VALIDATION ====================

  /**
   * Validate diplotype consistency
   * Returns array of validation errors (empty if valid)
   */
  static validateDiplotypeConsistency(result: DiplotypeResult): string[] {
    const errors: string[] = [];

    // Rule 1: If no variants detected, diplotype should be reference
    if (result.detectedVariants.length === 0 && result.diplotype !== '*1/*1') {
      if (!result.diplotype.includes('*1')) {
        errors.push(`Inconsistency: No variants detected but diplotype is ${result.diplotype} (expected *1/*1)`);
      }
    }

    // Rule 2: Activity score should match sum of allele scores
    const config = GENE_CONFIGS[result.detectedVariants[0]?.gene || ''];
    if (config) {
      const allele1Score = config.alleleDefinitions.find(d => d.allele === result.allele1)?.activityScore ?? 1;
      const allele2Score = config.alleleDefinitions.find(d => d.allele === result.allele2)?.activityScore ?? 1;
      const expectedScore = allele1Score + allele2Score;
      
      if (Math.abs(result.activityScore - expectedScore) > 0.01) {
        errors.push(`Inconsistency: Activity score ${result.activityScore} doesn't match allele sum ${expectedScore}`);
      }
    }

    // Rule 3: Phenotype should align with activity score
    const expectedPhenotype = this.activityScoreToPhenotype(
      result.detectedVariants[0]?.gene || 'CYP2C9', 
      result.activityScore
    );
    if (result.phenotype !== expectedPhenotype && result.activityScore >= 0) {
      errors.push(`Inconsistency: Phenotype ${result.phenotype} doesn't match activity score ${result.activityScore} (expected ${expectedPhenotype})`);
    }

    return errors;
  }

  /**
   * Validate warfarin-specific consistency
   */
  private static validateWarfarinConsistency(cyp2c9Result: DiplotypeResult): string[] {
    return this.validateDiplotypeConsistency(cyp2c9Result);
  }
}

// ==================== WARFARIN MULTI-GENE TYPES ====================

export interface WarfarinMultiGeneResult {
  drug: 'WARFARIN';
  analysisType: 'multi_gene';
  genes: {
    CYP2C9: {
      diplotype: string;
      activityScore: number;
      phenotypeCode: string;
      phenotypeLabel: string;
      detectedVariants: DetectedVariant[];
    };
    VKORC1: {
      rsid: string;
      genotype: string;
      genotypeDisplay: string;
      sensitivity: string;
      clinicalEffect: string;
      doseModifier: string;
      detectedVariant: DetectedVariant | null;
    };
    CYP4F2: {
      rsid: string;
      genotype: string;
      genotypeDisplay: string;
      clinicalEffect: string;
      doseModifier: string;
      detectedVariant: DetectedVariant | null;
    };
  };
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  doseRecommendation: WarfarinDoseRecommendation;
  allDetectedVariants: DetectedVariant[];
  totalVariantsDetected: number;
  validationErrors: string[];
  guidelineSource: string;
  cpicLevel: string;
}

export interface WarfarinDoseRecommendation {
  initialDoseStrategy: string;
  doseReductionPercent: number;
  adjustments: string[];
  monitoring: string[];
}
