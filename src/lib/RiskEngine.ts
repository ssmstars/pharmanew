/**
 * PharmaGuard - Risk Assessment Engine
 * Calculates pharmacogenomic risk based on drug, gene, and phenotype
 * Aligned with CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines
 */

import { SupportedDrug, SupportedGene, getPrimaryGene } from './DrugGeneMap';
import { Phenotype } from './VariantPhenotypeMap';
import { VCFVariant } from './VCFParser';

export type RiskLabel = "SAFE" | "ADJUST_DOSAGE" | "TOXIC" | "INEFFECTIVE" | "UNKNOWN";
export type Severity = "NONE" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface RiskAssessment {
  risk_label: RiskLabel;
  confidence_score: number; // 0-1
  severity: Severity;
}

export interface PharmacogenomicProfile {
  primary_gene: SupportedGene;
  diplotype: string;
  phenotype: string;
  detected_variants: Array<{
    rsID?: string;
    chromosome: string;  
    position: number;
    ref: string;
    alt: string;
    gene?: string;
    starAllele?: string;
  }>;
}

export interface ClinicalRecommendation {
  dosing_guidance?: string;
  monitoring_requirements?: string[];
  alternative_drugs?: string[];
  cpic_level?: "A" | "B" | "C" | "D";
  implementation_status?: "Required" | "Recommended" | "Optional" | "No Recommendation";
}

export interface RiskEngineResult {
  risk_assessment: RiskAssessment;
  pharmacogenomic_profile: PharmacogenomicProfile;
  clinical_recommendation: ClinicalRecommendation;
}

/**
 * Drug-specific risk assessment rules based on CPIC guidelines
 */
const DRUG_RISK_RULES: Record<SupportedDrug, Record<string, RiskAssessment & { clinical: ClinicalRecommendation }>> = {
  CODEINE: {
    "Poor": {
      risk_label: "INEFFECTIVE",
      confidence_score: 0.95,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Avoid codeine due to lack of efficacy. CYP2D6 poor metabolizers cannot convert codeine to its active metabolite morphine. Consider morphine, oxycodone, or non-opioid alternatives.",
        monitoring_requirements: ["Pain assessment", "Alternative pain management evaluation"],
        alternative_drugs: ["Morphine", "Oxycodone", "Hydromorphone", "Non-opioid analgesics (NSAIDs, acetaminophen)"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.88,
      severity: "MODERATE", 
      clinical: {
        dosing_guidance: "Consider alternative analgesic not metabolized by CYP2D6. If codeine is used, be alert to insufficient pain relief due to reduced morphine formation. Monitor closely for lack of efficacy.",
        monitoring_requirements: ["Pain assessment for adequate response", "Consider alternative if pain control inadequate"],
        alternative_drugs: ["Morphine", "Oxycodone", "Non-opioid analgesics"],
        cpic_level: "A",
        implementation_status: "Recommended"
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.93,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use label-recommended age or weight-specific dosing.",
        monitoring_requirements: ["Standard pain assessment", "Routine opioid monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    },
    "Ultrarapid": {
      risk_label: "TOXIC",
      confidence_score: 0.91,
      severity: "CRITICAL",
      clinical: {
        dosing_guidance: "Avoid codeine due to risk of life-threatening toxicity. CYP2D6 ultrarapid metabolizers convert codeine to morphine too rapidly, causing respiratory depression and CNS toxicity. Use alternative analgesics.",
        monitoring_requirements: ["If codeine inadvertently given: respiratory monitoring", "CNS depression assessment", "Oxygen saturation monitoring"],
        alternative_drugs: ["Morphine (with appropriate dose adjustment)", "Non-opioid analgesics (NSAIDs, acetaminophen)"],
        cpic_level: "A", 
        implementation_status: "Required"
      }
    }
  },

  CLOPIDOGREL: {
    "Poor": {
      risk_label: "INEFFECTIVE",
      confidence_score: 0.94,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Avoid clopidogrel. Use alternative antiplatelet agent.",
        monitoring_requirements: ["Platelet function testing", "Cardiovascular events monitoring"],
        alternative_drugs: ["Prasugrel", "Ticagrelor", "Aspirin"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.87,
      severity: "MODERATE",
      clinical: {
        dosing_guidance: "Consider alternative antiplatelet (prasugrel, ticagrelor) or increased dose (150mg daily).",
        monitoring_requirements: ["Platelet function testing", "Bleeding assessment"],
        alternative_drugs: ["Prasugrel", "Ticagrelor"],
        cpic_level: "A",
        implementation_status: "Recommended" 
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.92,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing (75mg daily).",
        monitoring_requirements: ["Standard cardiac monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    },
    "Rapid": {
      risk_label: "SAFE",
      confidence_score: 0.89,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing. Enhanced response expected.",
        monitoring_requirements: ["Bleeding assessment", "Standard cardiac monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    }
  },

  WARFARIN: {
    "Poor": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.91,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Start with 25-50% reduced dose. Frequent INR monitoring.",
        monitoring_requirements: ["Frequent INR monitoring", "Bleeding assessment", "Weekly INR initially"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE", 
      confidence_score: 0.88,
      severity: "MODERATE",
      clinical: {
        dosing_guidance: "Start with 25% reduced dose. Enhanced monitoring.",
        monitoring_requirements: ["Enhanced INR monitoring", "Bleeding assessment"],
        cpic_level: "A",
        implementation_status: "Recommended"
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.93,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing algorithm.",
        monitoring_requirements: ["Standard INR monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    }
  },

  SIMVASTATIN: {
    "Poor": {
      risk_label: "TOXIC",
      confidence_score: 0.92,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Avoid high-dose simvastatin (>20mg). Consider alternative statin.",
        monitoring_requirements: ["CK monitoring", "Myalgia assessment", "Liver function tests"],
        alternative_drugs: ["Pravastatin", "Rosuvastatin", "Fluvastatin"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.88,
      severity: "MODERATE",
      clinical: {
        dosing_guidance: "Use lower dose (≤20mg) or alternative statin.",
        monitoring_requirements: ["CK monitoring", "Myalgia assessment"],
        alternative_drugs: ["Pravastatin", "Rosuvastatin"],
        cpic_level: "B",
        implementation_status: "Recommended"
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.94,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing.",
        monitoring_requirements: ["Standard lipid monitoring"],
        cpic_level: "B",
        implementation_status: "Optional"
      }
    }
  },

  AZATHIOPRINE: {
    "Poor": {
      risk_label: "TOXIC",
      confidence_score: 0.96,
      severity: "CRITICAL",
      clinical: {
        dosing_guidance: "Avoid azathioprine or use extreme caution with 90% dose reduction.",
        monitoring_requirements: ["Weekly CBC with differential", "Liver function tests", "Infection monitoring"],
        alternative_drugs: ["Methotrexate", "Mycophenolate", "Biologics"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.91,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Start with 30-70% of standard dose.",
        monitoring_requirements: ["Frequent CBC monitoring", "Liver function tests"],
        cpic_level: "A", 
        implementation_status: "Required"
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.95,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing (2-3mg/kg/day).",
        monitoring_requirements: ["Standard CBC monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    }
  },

  FLUOROURACIL: {
    "Poor": {
      risk_label: "TOXIC",
      confidence_score: 0.94,
      severity: "CRITICAL",
      clinical: {
        dosing_guidance: "Avoid fluorouracil or use extreme caution with significant dose reduction.",
        monitoring_requirements: ["Severe toxicity monitoring", "CBC with differential", "Mucositis assessment"],
        alternative_drugs: ["Alternative chemotherapy regimens"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Intermediate": {
      risk_label: "ADJUST_DOSAGE",
      confidence_score: 0.89,
      severity: "HIGH",
      clinical: {
        dosing_guidance: "Start with 50% dose reduction and escalate based on tolerance.",
        monitoring_requirements: ["Enhanced toxicity monitoring", "Frequent CBC"],
        cpic_level: "A",
        implementation_status: "Required"
      }
    },
    "Normal": {
      risk_label: "SAFE",
      confidence_score: 0.93,
      severity: "LOW",
      clinical: {
        dosing_guidance: "Use standard dosing protocols.",
        monitoring_requirements: ["Standard oncology monitoring"],
        cpic_level: "A",
        implementation_status: "Optional"
      }
    }
  }
};

export class RiskEngine {
  /**
   * Assess pharmacogenomic risk for a drug based on phenotype
   */
  static assessRisk(
    drug: SupportedDrug,
    phenotype: Phenotype | null,
    variants: VCFVariant[],
    diplotype: string
  ): RiskEngineResult {
    const primaryGene = getPrimaryGene(drug);

    if (!phenotype) {
      return {
        risk_assessment: {
          risk_label: "UNKNOWN",
          confidence_score: 0.4,
          severity: "NONE"
        },
        pharmacogenomic_profile: {
          primary_gene: primaryGene,
          diplotype: diplotype,
          phenotype: "Unknown",
          detected_variants: variants.map(v => ({
            rsID: v.rsID,
            chromosome: v.chromosome,
            position: v.position,
            ref: v.ref,
            alt: v.alt,
            gene: v.gene,
            starAllele: v.starAllele
          }))
        },
        clinical_recommendation: {
          dosing_guidance: "Insufficient genetic evidence to provide dosing guidance. Consider confirmatory testing.",
          monitoring_requirements: ["Clinical monitoring based on standard protocols"],
          cpic_level: "D",
          implementation_status: "No Recommendation"
        }
      };
    }
    
    // Get risk assessment for drug-phenotype combination
    const drugRules = DRUG_RISK_RULES[drug];
    const riskRule = drugRules[phenotype.activity] || drugRules["Normal"];
    
    // Adjust confidence based on phenotype confidence
    const adjustedConfidence = Math.min(
      riskRule.confidence_score * phenotype.confidence,
      1.0
    );

    const risk_assessment: RiskAssessment = {
      risk_label: riskRule.risk_label,
      confidence_score: adjustedConfidence,
      severity: riskRule.severity
    };

    // Build pharmacogenomic profile
    const pharmacogenomic_profile: PharmacogenomicProfile = {
      primary_gene: primaryGene,
      diplotype: diplotype,
      phenotype: phenotype.name,
      detected_variants: variants.map(v => ({
        rsID: v.rsID,
        chromosome: v.chromosome,
        position: v.position,
        ref: v.ref,
        alt: v.alt,
        gene: v.gene,
        starAllele: v.starAllele
      }))
    };

    return {
      risk_assessment,
      pharmacogenomic_profile,
      clinical_recommendation: riskRule.clinical
    };
  }

  /**
   * Calculate overall confidence score based on available data
   */
  static calculateOverallConfidence(
    vcfParsingSuccess: boolean,
    variantsDetected: number,
    phenotypeConfidence: number
  ): number {
    let baseScore = 0.5;
    
    // VCF parsing success bonus
    if (vcfParsingSuccess) {
      baseScore += 0.2;
    }
    
    // Variants detected bonus
    if (variantsDetected > 0) {
      baseScore += Math.min(variantsDetected * 0.1, 0.2);
    }
    
    // Apply phenotype confidence
    return Math.min(baseScore * phenotypeConfidence, 1.0);
  }

  /**
   * Get risk color for UI display
   */
  static getRiskColor(riskLabel: RiskLabel): string {
    switch (riskLabel) {
      case "SAFE":
        return "green";
      case "ADJUST_DOSAGE": 
        return "yellow";
      case "TOXIC":
      case "INEFFECTIVE":
        return "red";  
      case "UNKNOWN":
        return "gray";
      default:
        return "gray";
    }
  }

  /**
   * Get risk badge text
   */
  static getRiskBadgeText(riskLabel: RiskLabel): string {
    switch (riskLabel) {
      case "SAFE":
        return "🟢 Safe";
      case "ADJUST_DOSAGE":
        return "🟡 Adjust Dosage"; 
      case "TOXIC":
        return "🔴 Toxic";
      case "INEFFECTIVE":
        return "🔴 Ineffective";
      case "UNKNOWN":
        return "⚪ Unknown";
      default:
        return "⚪ Unknown";
    }
  }

  /**
   * Validate risk assessment parameters
   */
  static validateAssessment(drug: string, phenotypeActivity: string): { valid: boolean; error?: string } {
    if (!drug) {
      return { valid: false, error: "Drug is required" };
    }

    if (!(drug in DRUG_RISK_RULES)) {
      return { valid: false, error: `Unsupported drug: ${drug}` };
    }

    if (!phenotypeActivity) {
      return { valid: false, error: "Phenotype activity is required" };
    }

    const drugRules = DRUG_RISK_RULES[drug as SupportedDrug];
    if (!(phenotypeActivity in drugRules)) {
      return { valid: false, error: `Unsupported phenotype for ${drug}: ${phenotypeActivity}` };
    }

    return { valid: true };
  }
}