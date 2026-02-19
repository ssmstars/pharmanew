/**
 * PharmaGuard - Shared Types and Validation Schemas
 */

import { z } from 'zod';

// Zod validation schemas
export const AnalysisRequestSchema = z.object({
  vcf_content: z.string().min(1, 'VCF content is required'),
  drug: z.enum(['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL']).optional(),
  drugs: z.array(z.enum(['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL'])).optional(),
  patient_id: z.string().optional(),
  analysis_type: z.enum(['single_drug', 'polypharmacy']).default('single_drug')
});

export const AnalysisResponseSchema = z.object({
  patient_id: z.string(),
  drug: z.string().optional(), 
  drugs: z.array(z.string()).optional(),
  analysis_type: z.enum(['single_drug', 'polypharmacy']),
  timestamp: z.string(),
  risk_assessment: z.object({
    risk_label: z.enum(['Safe', 'Adjust Dosage', 'Toxic', 'Ineffective', 'Unknown']),
    confidence_score: z.number().min(0).max(1),
    severity: z.enum(['none', 'low', 'moderate', 'high', 'critical'])
  }),
  polypharmacy_alert: z.object({
    polypharmacy_flag: z.boolean(),
    overall_patient_risk: z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']),
    highest_risk_drug: z.string().optional(),
    interacting_pairs: z.array(z.object({
      drug_a: z.string(),
      drug_b: z.string(),
      severity: z.string()
    })),
    phenoconversion_risk: z.boolean()
  }).optional(),
  pharmacogenomic_profile: z.object({
    primary_gene: z.string(),
    diplotype: z.string(),
    phenotype: z.enum(['PM', 'IM', 'NM', 'RM', 'URM', 'Unknown']),
    detected_variants: z.array(z.object({
      rsid: z.string().optional(),
      chromosome: z.string(),
      position: z.number(),
      ref: z.string(),
      alt: z.string(),
      gene: z.string().optional(),
      starAllele: z.string().optional()
    }))
  }),
  clinical_recommendation: z.object({
    dosing_guidance: z.string().optional(),
    monitoring_requirements: z.array(z.string()).optional(),
    alternative_drugs: z.array(z.string()).optional(),
    cpic_level: z.string().optional(),
    implementation_status: z.string().optional()
  }),
  llm_generated_explanation: z.object({
    summary: z.string(),
    mechanism: z.string(), 
    variant_interpretation: z.string()
  }),
  quality_metrics: z.object({
    vcf_parsing_success: z.boolean(),
    variants_detected: z.number(),
    llm_confidence: z.number().min(0).max(1)
  })
});

// Type exports
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
export type RiskLabel = AnalysisResponse['risk_assessment']['risk_label'];
export type Severity = AnalysisResponse['risk_assessment']['severity'];
export type PolypharmacyAlert = NonNullable<AnalysisResponse['polypharmacy_alert']>;
export type DrugInteractionPair = PolypharmacyAlert['interacting_pairs'][0];

// UI State types
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result?: AnalysisResponse;
  error?: string;
}

// Polypharmacy Analysis Types
export interface PolypharmacyAnalysisRequest {
  vcf_content: string;
  drugs: string[];
  patient_id?: string;
}

export interface DrugDrugInteraction {
  drug_a: string;
  drug_b: string;
  mechanism: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  clinical_effect: string;
}

// Drug display information
export const DRUG_INFO = {
  CODEINE: {
    name: 'Codeine',
    category: 'Opioid Analgesic',
    description: 'Pain medication metabolized by CYP2D6'
  },
  WARFARIN: {
    name: 'Warfarin', 
    category: 'Anticoagulant',
    description: 'Blood thinner metabolized by CYP2C9'
  },
  CLOPIDOGREL: {
    name: 'Clopidogrel (Plavix)',
    category: 'Antiplatelet',
    description: 'Blood thinner activated by CYP2C19'
  },
  SIMVASTATIN: {
    name: 'Simvastatin',
    category: 'Statin',
    description: 'Cholesterol medication transported by SLCO1B1'
  },
  AZATHIOPRINE: {
    name: 'Azathioprine',
    category: 'Immunosuppressant', 
    description: 'Immune system medication metabolized by TPMT'
  },
  FLUOROURACIL: {
    name: 'Fluorouracil (5-FU)',
    category: 'Chemotherapy',
    description: 'Cancer medication metabolized by DPYD'
  }
} as const;